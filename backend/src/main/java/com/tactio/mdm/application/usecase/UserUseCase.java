package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.BadRequestException;
import com.tactio.mdm.api.exception.ConflictException;
import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.user.ChangePasswordRequest;
import com.tactio.mdm.application.dto.user.CreateUserRequest;
import com.tactio.mdm.application.dto.user.UpdateUserRequest;
import com.tactio.mdm.application.dto.user.UserResponse;
import com.tactio.mdm.application.mapper.UserMapper;
import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.AuditAction;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.infrastructure.audit.AuditLogService;
import com.tactio.mdm.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse get(UUID id) {
        return UserMapper.toResponse(findOrThrow(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Já existe um usuário com este e-mail");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setActive(true);
        userRepository.save(user);

        auditLogService.record(AuditAction.CREATE, "User", user.getId().toString(), "Usuário criado: " + user.getEmail());
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = findOrThrow(id);
        user.setName(request.name());
        user.setRole(request.role());
        user.setActive(request.active());
        userRepository.save(user);

        auditLogService.record(AuditAction.UPDATE, "User", user.getId().toString(), null);
        return UserMapper.toResponse(user);
    }

    @Transactional
    public void delete(UUID id) {
        User user = findOrThrow(id);
        userRepository.delete(user);
        auditLogService.record(AuditAction.DELETE, "User", id.toString(), null);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        var currentUserId = currentUserProvider.requireCurrentUser().getId();
        User user = findOrThrow(currentUserId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Senha atual incorreta");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditLogService.record(AuditAction.UPDATE, "User", user.getId().toString(), "Senha alterada");
    }

    private User findOrThrow(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Usuário", id));
    }
}
