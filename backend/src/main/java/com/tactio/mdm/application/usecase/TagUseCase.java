package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.org.TagRequest;
import com.tactio.mdm.application.dto.org.TagResponse;
import com.tactio.mdm.application.mapper.OrgMapper;
import com.tactio.mdm.domain.entity.Tag;
import com.tactio.mdm.domain.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagUseCase {

    private static final String CACHE_NAME = "tags";

    private final TagRepository tagRepository;

    @Cacheable(CACHE_NAME)
    @Transactional(readOnly = true)
    public List<TagResponse> list() {
        return tagRepository.findAll().stream().map(OrgMapper::toResponse).toList();
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public TagResponse create(TagRequest request) {
        Tag tag = new Tag();
        tag.setName(request.name());
        tag.setColor(request.color());
        tagRepository.save(tag);
        return OrgMapper.toResponse(tag);
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public TagResponse update(UUID id, TagRequest request) {
        Tag tag = tagRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Tag", id));
        tag.setName(request.name());
        tag.setColor(request.color());
        tagRepository.save(tag);
        return OrgMapper.toResponse(tag);
    }

    @CacheEvict(value = CACHE_NAME, allEntries = true)
    @Transactional
    public void delete(UUID id) {
        if (!tagRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Tag", id);
        }
        tagRepository.deleteById(id);
    }
}
