package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.alert.AlertResponse;
import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.usecase.AlertUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Alertas")
@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertUseCase alertUseCase;

    @GetMapping
    public ResponseEntity<PageResponse<AlertResponse>> list(
            @RequestParam(defaultValue = "false") boolean unreadOnly, Pageable pageable) {
        return ResponseEntity.ok(alertUseCase.list(unreadOnly, pageable));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        alertUseCase.markRead(id);
        return ResponseEntity.noContent().build();
    }
}
