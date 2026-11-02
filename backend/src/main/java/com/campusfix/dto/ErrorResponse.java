package com.campusfix.dto;

import java.util.Collections;
import java.util.Map;

public record ErrorResponse(
    int status,
    String message,
    Map<String, String> fields
) {
    public ErrorResponse(int status, String message) {
        this(status, message, Collections.emptyMap());
    }
}
