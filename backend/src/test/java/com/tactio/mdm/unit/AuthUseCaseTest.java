package com.tactio.mdm.unit;

import com.tactio.mdm.api.exception.UnauthorizedException;
import com.tactio.mdm.application.dto.auth.LoginRequest;
import com.tactio.mdm.application.usecase.AuthUseCase;
import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.UserRole;
import com.tactio.mdm.domain.repository.RefreshTokenRepository;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.infrastructure.audit.AuditLogService;
import com.tactio.mdm.security.CurrentUserProvider;
import com.tactio.mdm.security.JwtProperties;
import com.tactio.mdm.security.JwtTokenProvider;
import com.tactio.mdm.security.TwoFactorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthUseCaseTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private JwtProperties jwtProperties;
    @Mock
    private TwoFactorService twoFactorService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private AuthUseCase authUseCase;

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setName("Admin");
        activeUser.setEmail("admin@tactio.com");
        activeUser.setPasswordHash("hashed");
        activeUser.setRole(UserRole.ADMIN);
        activeUser.setActive(true);
    }

    @Test
    void loginWithInvalidPasswordThrowsUnauthorized() {
        when(userRepository.findByEmailIgnoreCase("admin@tactio.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong-password", "hashed")).thenReturn(false);

        LoginRequest request = new LoginRequest("admin@tactio.com", "wrong-password", null);

        assertThatThrownBy(() -> authUseCase.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void loginWithUnknownEmailThrowsUnauthorized() {
        when(userRepository.findByEmailIgnoreCase("ghost@tactio.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("ghost@tactio.com", "any-password", null);

        assertThatThrownBy(() -> authUseCase.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void loginWith2faEnabledButMissingCodeThrowsUnauthorized() {
        activeUser.setTwoFaEnabled(true);
        activeUser.setTwoFaSecret("SECRET");
        when(userRepository.findByEmailIgnoreCase("admin@tactio.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("correct-password", "hashed")).thenReturn(true);

        LoginRequest request = new LoginRequest("admin@tactio.com", "correct-password", null);

        assertThatThrownBy(() -> authUseCase.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("2FA");
    }

    @Test
    void successfulLoginReturnsTokens() {
        when(userRepository.findByEmailIgnoreCase("admin@tactio.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("correct-password", "hashed")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token-value");
        when(jwtProperties.getRefreshTokenExpirationMs()).thenReturn(604_800_000L);

        LoginRequest request = new LoginRequest("admin@tactio.com", "correct-password", null);

        var response = authUseCase.login(request);

        assertThat(response.accessToken()).isEqualTo("access-token-value");
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("admin@tactio.com");
    }
}
