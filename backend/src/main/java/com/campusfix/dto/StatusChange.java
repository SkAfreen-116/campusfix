package com.campusfix.dto;

import com.campusfix.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChange(
    @NotNull(message = "Status is required")
    IssueStatus status
) {
}
