package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.org.DepartmentRequest;
import com.tactio.mdm.application.dto.org.DepartmentResponse;
import com.tactio.mdm.application.mapper.OrgMapper;
import com.tactio.mdm.domain.entity.Department;
import com.tactio.mdm.domain.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentUseCase {

    private static final String CACHE_NAME = "departments";

    private final DepartmentRepository departmentRepository;

    @Cacheable(CACHE_NAME)
    @Transactional(readOnly = true)
    public List<DepartmentResponse> list() {
        return departmentRepository.findAll().stream().map(OrgMapper::toResponse).toList();
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        Department department = new Department();
        department.setName(request.name());
        department.setDescription(request.description());
        departmentRepository.save(department);
        return OrgMapper.toResponse(department);
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Departamento", id));
        department.setName(request.name());
        department.setDescription(request.description());
        departmentRepository.save(department);
        return OrgMapper.toResponse(department);
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!departmentRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Departamento", id);
        }
        departmentRepository.deleteById(id);
    }
}
