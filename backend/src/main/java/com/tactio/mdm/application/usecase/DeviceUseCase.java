package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ConflictException;
import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.device.CreateDeviceRequest;
import com.tactio.mdm.application.dto.device.DashboardSummaryResponse;
import com.tactio.mdm.application.dto.device.DeviceProvisionResponse;
import com.tactio.mdm.application.dto.device.DeviceResponse;
import com.tactio.mdm.application.dto.device.UpdateDeviceRequest;
import com.tactio.mdm.application.mapper.AlertMapper;
import com.tactio.mdm.application.mapper.DeviceMapper;
import com.tactio.mdm.application.mapper.LocationMapper;
import com.tactio.mdm.domain.entity.Department;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.Tag;
import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.AuditAction;
import com.tactio.mdm.domain.enums.DeviceStatus;
import com.tactio.mdm.domain.repository.AlertRepository;
import com.tactio.mdm.domain.repository.DepartmentRepository;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.LocationHistoryRepository;
import com.tactio.mdm.domain.repository.TagRepository;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.domain.repository.spec.DeviceSpecifications;
import com.tactio.mdm.infrastructure.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeviceUseCase {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final DeviceRepository deviceRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final AlertRepository alertRepository;
    private final LocationHistoryRepository locationHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<DeviceResponse> list(DeviceStatus status, UUID departmentId, UUID tagId, String search, Pageable pageable) {
        Specification<Device> spec = Specification
                .where(DeviceSpecifications.statusEquals(status))
                .and(DeviceSpecifications.departmentEquals(departmentId))
                .and(DeviceSpecifications.tagEquals(tagId))
                .and(DeviceSpecifications.searchTerm(search));
        return deviceRepository.findAll(spec, pageable).map(DeviceMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DeviceResponse get(UUID id) {
        return DeviceMapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public DeviceProvisionResponse create(CreateDeviceRequest request) {
        if (request.imei() != null && deviceRepository.findByImei(request.imei()).isPresent()) {
            throw new ConflictException("Já existe um dispositivo com este IMEI");
        }
        if (request.serialNumber() != null && deviceRepository.findBySerialNumber(request.serialNumber()).isPresent()) {
            throw new ConflictException("Já existe um dispositivo com este número de série");
        }

        Device device = new Device();
        device.setName(request.name());
        device.setModel(request.model());
        device.setManufacturer(request.manufacturer());
        device.setAndroidVersion(request.androidVersion());
        device.setImei(request.imei());
        device.setSerialNumber(request.serialNumber());
        device.setStatus(DeviceStatus.PROVISIONING);
        applyRelations(device, request.departmentId(), request.responsibleUserId(), request.tagIds());

        String apiKey = generateApiKey();
        device.setApiKeyHash(passwordEncoder.encode(apiKey));

        deviceRepository.save(device);
        auditLogService.record(AuditAction.CREATE, "Device", device.getId().toString(), "Dispositivo criado: " + device.getName());

        return new DeviceProvisionResponse(device.getId(), apiKey);
    }

    @Transactional
    public DeviceResponse update(UUID id, UpdateDeviceRequest request) {
        Device device = findOrThrow(id);
        device.setName(request.name());
        device.setModel(request.model());
        device.setManufacturer(request.manufacturer());
        device.setStatus(request.status());
        applyRelations(device, request.departmentId(), request.responsibleUserId(), request.tagIds());
        deviceRepository.save(device);

        auditLogService.record(AuditAction.UPDATE, "Device", device.getId().toString(), null);
        return DeviceMapper.toResponse(device);
    }

    @Transactional
    public void delete(UUID id) {
        Device device = findOrThrow(id);
        deviceRepository.delete(device);
        auditLogService.record(AuditAction.DELETE, "Device", id.toString(), null);
    }

    @Transactional
    public DeviceProvisionResponse regenerateApiKey(UUID id) {
        Device device = findOrThrow(id);
        String apiKey = generateApiKey();
        device.setApiKeyHash(passwordEncoder.encode(apiKey));
        deviceRepository.save(device);
        auditLogService.record(AuditAction.UPDATE, "Device", id.toString(), "Chave de API regenerada");
        return new DeviceProvisionResponse(device.getId(), apiKey);
    }

    @Transactional
    public void markSynced(UUID id) {
        Device device = findOrThrow(id);
        device.setLastSyncAt(java.time.Instant.now());
        if (device.getStatus() == DeviceStatus.PROVISIONING || device.getStatus() == DeviceStatus.OFFLINE) {
            device.setStatus(DeviceStatus.ONLINE);
        }
        deviceRepository.save(device);
    }

    @Transactional
    public void lock(UUID id) {
        Device device = findOrThrow(id);
        device.setStatus(DeviceStatus.BLOCKED);
        deviceRepository.save(device);
        auditLogService.record(AuditAction.DEVICE_LOCKED, "Device", id.toString(), null);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse dashboardSummary() {
        long total = deviceRepository.count();
        long online = deviceRepository.countByStatus(DeviceStatus.ONLINE);
        long offline = deviceRepository.countByStatus(DeviceStatus.OFFLINE);
        long unreadAlerts = alertRepository.countByReadFalse();

        var recentAlerts = alertRepository.findByReadFalseOrderByCreatedAtDesc(PageRequest.of(0, 10))
                .stream().map(AlertMapper::toResponse).toList();

        var recentLocations = deviceRepository.findAll(PageRequest.of(0, 100, Sort.by("name"))).stream()
                .map(device -> locationHistoryRepository.findTop1ByDeviceIdOrderByCapturedAtDesc(device.getId()))
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0))
                .map(LocationMapper::toResponse)
                .collect(Collectors.toMap(loc -> loc.deviceId(), loc -> loc));

        long lowBattery = 0;

        return new DashboardSummaryResponse(total, online, offline, lowBattery, unreadAlerts, recentAlerts, recentLocations);
    }

    private void applyRelations(Device device, UUID departmentId, UUID responsibleUserId, Set<UUID> tagIds) {
        if (departmentId != null) {
            Department department = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> ResourceNotFoundException.of("Departamento", departmentId));
            device.setDepartment(department);
        } else {
            device.setDepartment(null);
        }

        if (responsibleUserId != null) {
            User user = userRepository.findById(responsibleUserId)
                    .orElseThrow(() -> ResourceNotFoundException.of("Usuário", responsibleUserId));
            device.setResponsibleUser(user);
        } else {
            device.setResponsibleUser(null);
        }

        if (tagIds != null) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(tagIds));
            device.setTags(tags);
        }
    }

    private Device findOrThrow(UUID id) {
        return deviceRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Dispositivo", id));
    }

    private String generateApiKey() {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
