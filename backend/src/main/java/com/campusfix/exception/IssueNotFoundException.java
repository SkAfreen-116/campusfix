package com.campusfix.exception;

public class IssueNotFoundException extends RuntimeException {
    public IssueNotFoundException(Long id) {
        super("Issue not found with id: " + id);
    }

    public IssueNotFoundException(String message) {
        super(message);
    }
}
