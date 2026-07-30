package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.PolicyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PolicyAssignmentRepository extends JpaRepository<PolicyAssignment, UUID> {

    List<PolicyAssignment> findByDeviceId(UUID deviceId);

    List<PolicyAssignment> findByDepartmentId(UUID departmentId);

    List<PolicyAssignment> findByTag_Id(UUID tagId);

    List<PolicyAssignment> findByPolicyId(UUID policyId);
}
