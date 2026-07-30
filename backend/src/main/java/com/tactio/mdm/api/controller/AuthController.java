package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.auth.Enable2FAResponse;
import com.tactio.mdm.application.dto.auth.LoginRequest;
import com.tactio.mdm.application.dto.auth.RefreshTokenRequest;
import com.tactio.mdm.application.dto.auth.TokenResponse;
import com.tactio.mdm.application.dto.auth.Verify2FARequest;
import com.tactio.mdm.application.dto.user.UserResponse;
import com.tactio.mdm.application.mapper.UserMapper;
import com.tactio.mdm.application.usecase.AuthUseCase;
import com.tactio.mdm.domain.repository.UserRepository;
import com.tactio.mdm.security.CurrentUserProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticação")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authUseCase.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authUseCase.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authUseCase.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        var userId = currentUserProvider.requireCurrentUser().getId();
        UserResponse response = userRepository.findById(userId).map(UserMapper::toResponse).orElseThrow();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<Enable2FAResponse> enable2FA() {
        return ResponseEntity.ok(authUseCase.startEnable2FA());
    }

    @PostMapping("/2fa/confirm")
    public ResponseEntity<Void> confirm2FA(@Valid @RequestBody Verify2FARequest request) {
        authUseCase.confirmEnable2FA(request.code());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<Void> disable2FA() {
        authUseCase.disable2FA();
        return ResponseEntity.noContent().build();
    }
}
