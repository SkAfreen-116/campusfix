package com.campusfix.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(Integer id) {
        super("Category not found with id: " + id);
    }

    public CategoryNotFoundException(String message) {
        super(message);
    }
}
