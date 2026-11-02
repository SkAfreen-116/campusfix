package com.campusfix.dto;

import com.campusfix.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record IssueRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 120, message = "Title must be between 5 and 120 characters")
    String title,

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    String description,

    @NotNull(message = "Category is required")
    Integer categoryId,

    @NotNull(message = "Priority is required")
    Priority priority,

    @NotBlank(message = "Reporter name is required")
    @Size(max = 80, message = "Reporter name cannot exceed 80 characters")
    String reporterName
) {
}
