package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PolicyRepository extends JpaRepository<Policy, UUID> {
}
