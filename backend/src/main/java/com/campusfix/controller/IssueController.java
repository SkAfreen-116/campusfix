package com.campusfix.controller;

import com.campusfix.dto.IssueRequest;
import com.campusfix.dto.IssueResponse;
import com.campusfix.dto.StatusChange;
import com.campusfix.model.IssueStatus;
import com.campusfix.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;

    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping
    public ResponseEntity<Page<IssueResponse>> getIssues(
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(issueService.getIssues(status, q, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getSummary() {
        return ResponseEntity.ok(issueService.getSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse created = issueService.createIssue(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueRequest request
    ) {
        return ResponseEntity.ok(issueService.updateIssue(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChange request
    ) {
        return ResponseEntity.ok(issueService.changeStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
