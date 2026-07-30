package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.BadRequestException;
import com.tactio.mdm.api.exception.UnauthorizedException;
import com.tactio.mdm.application.dto.auth.Enable2FAResponse;
import com.tactio.mdm.application.dto.auth.LoginRequest;
import com.tactio.mdm.application.dto.auth.TokenResponse;
import com.tactio.mdm.application.mapper.UserMapper;
import com.tactio.mdm.domain.entity.RefreshToken;
import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.AuditAction;
import com.tactio.mdm.domain.repository.RefreshTokenRepository;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.infrastructure.audit.AuditLogService;
import com.tactio.mdm.security.CurrentUserProvider;
import com.tactio.mdm.security.JwtProperties;
import com.tactio.mdm.security.JwtTokenProvider;
import com.tactio.mdm.security.TwoFactorService;
import com.tactio.mdm.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final TwoFactorService twoFactorService;
    private final AuditLogService auditLogService;
    private final CurrentUserProvider currentUserProvider;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Credenciais inválidas"));

        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditLogService.recordForUser(user, AuditAction.LOGIN_FAILED, "User", user.getId().toString(), null);
            throw new UnauthorizedException("Credenciais inválidas");
        }

        if (user.isTwoFaEnabled()) {
            if (request.totpCode() == null || request.totpCode().isBlank()) {
                throw new UnauthorizedException("Código 2FA obrigatório");
            }
            if (!twoFactorService.verifyCode(user.getTwoFaSecret(), request.totpCode())) {
                auditLogService.recordForUser(user, AuditAction.LOGIN_FAILED, "User", user.getId().toString(), "2FA inválido");
                throw new UnauthorizedException("Código 2FA inválido");
            }
        }

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = issueRefreshToken(user);

        auditLogService.recordForUser(user, AuditAction.LOGIN, "User", user.getId().toString(), null);

        return TokenResponse.of(accessToken, refreshToken, UserMapper.toResponse(user));
    }

    @Transactional
    public TokenResponse refresh(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Refresh token inválido"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expirado");
        }

        User user = stored.getUser();
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String newRefreshToken = issueRefreshToken(user);

        return TokenResponse.of(accessToken, newRefreshToken, UserMapper.toResponse(user));
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
        currentUserProvider.getCurrentUserId().ifPresent(userId ->
                userRepository.findById(userId).ifPresent(user ->
                        auditLogService.recordForUser(user, AuditAction.LOGOUT, "User", user.getId().toString(), null)));
    }

    @Transactional
    public Enable2FAResponse startEnable2FA() {
        User user = currentUser();
        String secret = twoFactorService.generateSecret();
        user.setTwoFaSecret(secret);
        user.setTwoFaEnabled(false);
        userRepository.save(user);
        String qrCode = twoFactorService.generateQrCodeImageBase64(secret, user.getEmail());
        return new Enable2FAResponse(secret, qrCode);
    }

    @Transactional
    public void confirmEnable2FA(String code) {
        User user = currentUser();
        if (user.getTwoFaSecret() == null || !twoFactorService.verifyCode(user.getTwoFaSecret(), code)) {
            throw new BadRequestException("Código 2FA inválido");
        }
        user.setTwoFaEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disable2FA() {
        User user = currentUser();
        user.setTwoFaEnabled(false);
        user.setTwoFaSecret(null);
        userRepository.save(user);
    }

    private User currentUser() {
        var userId = currentUserProvider.requireCurrentUser().getId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado"));
    }

    private String issueRefreshToken(User user) {
        byte[] randomBytes = new byte[48];
        SECURE_RANDOM.nextBytes(randomBytes);
        String tokenValue = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenValue);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);

        return tokenValue;
    }
}
