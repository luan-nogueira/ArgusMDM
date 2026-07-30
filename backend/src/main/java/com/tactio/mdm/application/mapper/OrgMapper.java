package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.org.DepartmentResponse;
import com.tactio.mdm.application.dto.org.TagResponse;
import com.tactio.mdm.domain.entity.Department;
import com.tactio.mdm.domain.entity.Tag;

public final class OrgMapper {

    private OrgMapper() {
    }

    public static DepartmentResponse toResponse(Department department) {
        if (department == null) {
            return null;
        }
        return new DepartmentResponse(department.getId(), department.getName(), department.getDescription());
    }

    public static TagResponse toResponse(Tag tag) {
        if (tag == null) {
            return null;
        }
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }
}
