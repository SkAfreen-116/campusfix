package com.campusfix.dto;

import com.campusfix.model.Category;

public record CategoryResponse(
    Integer id,
    String name
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName()
        );
    }
}
