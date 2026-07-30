package com.tactio.mdm.unit;

import com.tactio.mdm.api.exception.ConflictException;
import com.tactio.mdm.application.dto.device.CreateDeviceRequest;
import com.tactio.mdm.application.usecase.DeviceUseCase;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.repository.AlertRepository;
import com.tactio.mdm.domain.repository.DepartmentRepository;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.LocationHistoryRepository;
import com.tactio.mdm.domain.repository.TagRepository;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.infrastructure.audit.AuditLogService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeviceUseCaseTest {

    @Mock
    private DeviceRepository deviceRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TagRepository tagRepository;
    @Mock
    private AlertRepository alertRepository;
    @Mock
    private LocationHistoryRepository locationHistoryRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private DeviceUseCase deviceUseCase;

    @Test
    void createWithDuplicateImeiThrowsConflict() {
        when(deviceRepository.findByImei("123456789012345"))
                .thenReturn(Optional.of(new Device()));

        CreateDeviceRequest request = new CreateDeviceRequest(
                "Tablet Estoque", "Galaxy Tab", "Samsung", "14",
                "123456789012345", null, null, null, null
        );

        assertThatThrownBy(() -> deviceUseCase.create(request))
                .isInstanceOf(ConflictException.class);
    }
}
