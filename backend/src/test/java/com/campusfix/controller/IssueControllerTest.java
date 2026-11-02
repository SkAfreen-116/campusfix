package com.campusfix.controller;

import com.campusfix.dto.IssueRequest;
import com.campusfix.dto.IssueResponse;
import com.campusfix.dto.StatusChange;
import com.campusfix.exception.IllegalTransitionException;
import com.campusfix.exception.IssueNotFoundException;
import com.campusfix.model.IssueStatus;
import com.campusfix.model.Priority;
import com.campusfix.service.IssueService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IssueController.class)
class IssueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IssueService issueService;

    @Test
    @DisplayName("Blank/short title -> 400 with field errors")
    void testBlankOrShortTitleReturns400WithFieldErrors() throws Exception {
        // Title is too short (3 characters < min 5)
        IssueRequest invalidRequest = new IssueRequest(
                "Bad",
                "Some detailed description about a problem",
                1,
                Priority.HIGH,
                "Alice"
        );

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed for request"))
                .andExpect(jsonPath("$.fields.title").exists());

        // Blank title
        IssueRequest blankTitleRequest = new IssueRequest(
                "   ",
                "Some detailed description about a problem",
                1,
                Priority.HIGH,
                "Alice"
        );

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankTitleRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fields.title").exists());
    }

    @Test
    @DisplayName("Unknown id -> 404 with IssueNotFoundException")
    void testUnknownIdReturns404() throws Exception {
        when(issueService.getIssueById(999L)).thenThrow(new IssueNotFoundException(999L));

        mockMvc.perform(get("/api/issues/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Issue not found with id: 999"))
                .andExpect(jsonPath("$.fields").isEmpty());
    }

    @Test
    @DisplayName("Illegal status move -> 409 with IllegalTransitionException")
    void testIllegalStatusMoveReturns409() throws Exception {
        StatusChange statusChange = new StatusChange(IssueStatus.RESOLVED);

        when(issueService.changeStatus(eq(1L), eq(IssueStatus.RESOLVED)))
                .thenThrow(new IllegalTransitionException(IssueStatus.OPEN, IssueStatus.RESOLVED));

        mockMvc.perform(patch("/api/issues/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusChange)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Cannot transition issue status from OPEN to RESOLVED"))
                .andExpect(jsonPath("$.fields").isEmpty());
    }

    @Test
    @DisplayName("Valid create -> 201 with Location header and body")
    void testCreateIssueReturns201() throws Exception {
        IssueRequest request = new IssueRequest(
                "Broken AC in Lecture Hall",
                "The air conditioner is making loud noises and leaking water",
                2,
                Priority.HIGH,
                "John Doe"
        );

        IssueResponse response = new IssueResponse(
                42L,
                "Broken AC in Lecture Hall",
                "The air conditioner is making loud noises and leaking water",
                2,
                "Classroom",
                Priority.HIGH,
                IssueStatus.OPEN,
                Instant.now(),
                Instant.now()
        );

        when(issueService.createIssue(any(IssueRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/issues/42"))
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.title").value("Broken AC in Lecture Hall"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @DisplayName("Valid status update -> 200 OK")
    void testValidStatusUpdateReturns200() throws Exception {
        StatusChange statusChange = new StatusChange(IssueStatus.IN_PROGRESS);

        IssueResponse response = new IssueResponse(
                42L,
                "Broken AC in Lecture Hall",
                "The air conditioner is making loud noises and leaking water",
                2,
                "Classroom",
                Priority.HIGH,
                IssueStatus.IN_PROGRESS,
                Instant.now(),
                Instant.now()
        );

        when(issueService.changeStatus(eq(42L), eq(IssueStatus.IN_PROGRESS))).thenReturn(response);

        mockMvc.perform(patch("/api/issues/42/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusChange)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("Delete issue -> 204 No Content")
    void testDeleteIssueReturns204() throws Exception {
        doNothing().when(issueService).deleteIssue(42L);

        mockMvc.perform(delete("/api/issues/42"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Get summary -> 200 OK with counts")
    void testGetSummaryReturns200() throws Exception {
        when(issueService.getSummary()).thenReturn(Map.of(
                "OPEN", 5L,
                "IN_PROGRESS", 2L,
                "RESOLVED", 7L
        ));

        mockMvc.perform(get("/api/issues/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.OPEN").value(5))
                .andExpect(jsonPath("$.IN_PROGRESS").value(2))
                .andExpect(jsonPath("$.RESOLVED").value(7));
    }
}
