package com.campusfix.dto;

import com.campusfix.model.Issue;
import com.campusfix.model.IssueStatus;
import com.campusfix.model.Priority;
import java.time.Instant;

public record IssueResponse(
    Long id,
    String title,
    String description,
    Integer categoryId,
    String categoryName,
    Priority priority,
    IssueStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    public static IssueResponse from(Issue issue) {
        return new IssueResponse(
            issue.getId(),
            issue.getTitle(),
            issue.getDescription(),
            issue.getCategory() != null ? issue.getCategory().getId() : null,
            issue.getCategory() != null ? issue.getCategory().getName() : null,
            issue.getPriority(),
            issue.getStatus(),
            issue.getCreatedAt(),
            issue.getUpdatedAt()
        );
    }
}
