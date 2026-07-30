package com.tactio.mdm.security;

import com.tactio.mdm.domain.enums.DeviceStatus;
import com.tactio.mdm.domain.repository.DeviceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Autentica dispositivos Android nos endpoints de sincronização usando um par
 * (X-Device-Id, X-Device-Key) emitido no provisionamento, em vez do JWT de usuário.
 */
@RequiredArgsConstructor
public class DeviceApiKeyAuthFilter extends OncePerRequestFilter {

    public static final String DEVICE_ID_HEADER = "X-Device-Id";
    public static final String DEVICE_KEY_HEADER = "X-Device-Key";

    private final DeviceRepository deviceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String deviceIdHeader = request.getHeader(DEVICE_ID_HEADER);
        String deviceKey = request.getHeader(DEVICE_KEY_HEADER);

        if (StringUtils.hasText(deviceIdHeader) && StringUtils.hasText(deviceKey)) {
            try {
                UUID deviceId = UUID.fromString(deviceIdHeader);
                deviceRepository.findById(deviceId)
                        .filter(device -> device.getApiKeyHash() != null)
                        .filter(device -> passwordEncoder.matches(deviceKey, device.getApiKeyHash()))
                        .filter(device -> device.getStatus() != DeviceStatus.BLOCKED)
                        .ifPresent(device -> {
                            var authentication = new UsernamePasswordAuthenticationToken(
                                    device.getId(), null, List.of(new SimpleGrantedAuthority("ROLE_DEVICE")));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        });
            } catch (IllegalArgumentException ignored) {
                // ID de dispositivo mal formado: segue sem autenticar, endpoint retornará 401/403
            }
        }
        filterChain.doFilter(request, response);
    }
}
