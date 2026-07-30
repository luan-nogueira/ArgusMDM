package com.tactio.mdm.infrastructure.audit;

import com.tactio.mdm.domain.entity.AuditLog;
import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.AuditAction;
import com.tactio.mdm.domain.repository.AuditLogRepository;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditAction action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog();
        currentUserProvider.getCurrentUserId()
                .flatMap(userRepository::findById)
                .ifPresent(log::setUser);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(resolveClientIp());
        auditLogRepository.save(log);
    }

    public void recordForUser(User user, AuditAction action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(resolveClientIp());
        auditLogRepository.save(log);
    }

    private String resolveClientIp() {
        var attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            var request = servletAttributes.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return null;
    }
}
