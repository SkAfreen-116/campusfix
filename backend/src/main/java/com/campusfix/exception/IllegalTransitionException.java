package com.campusfix.exception;

import com.campusfix.model.IssueStatus;

public class IllegalTransitionException extends RuntimeException {
    public IllegalTransitionException(IssueStatus currentStatus, IssueStatus targetStatus) {
        super(String.format("Cannot transition issue status from %s to %s", currentStatus, targetStatus));
    }

    public IllegalTransitionException(String message) {
        super(message);
    }
}
