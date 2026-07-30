package com.tactio.mdm.config;

import com.tactio.mdm.domain.entity.User;
import com.tactio.mdm.domain.enums.UserRole;
import com.tactio.mdm.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Garante que exista pelo menos um usuário ADMIN no primeiro start, para que o
 * painel não fique inacessível em uma instalação nova. Só age se a tabela de
 * usuários estiver vazia; não sobrescreve contas já existentes.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSeedProperties adminSeedProperties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!adminSeedProperties.isSeedEnabled() || userRepository.count() > 0) {
            return;
        }

        User admin = new User();
        admin.setName(adminSeedProperties.getName());
        admin.setEmail(adminSeedProperties.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(adminSeedProperties.getPassword()));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        log.info("Usuário administrador inicial criado: {}", admin.getEmail());
    }
}
