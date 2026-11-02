package com.campusfix.service;

import com.campusfix.dto.IssueRequest;
import com.campusfix.dto.IssueResponse;
import com.campusfix.exception.IllegalTransitionException;
import com.campusfix.exception.IssueNotFoundException;
import com.campusfix.model.Category;
import com.campusfix.model.Issue;
import com.campusfix.model.IssueStatus;
import com.campusfix.model.Priority;
import com.campusfix.repository.CategoryRepository;
import com.campusfix.repository.IssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private IssueService issueService;

    private Category hostelCat;
    private Issue sampleIssue;

    @BeforeEach
    void setUp() {
        hostelCat = new Category(1, "Hostel");
        sampleIssue = new Issue("Wi-Fi down in Room 101", "Cannot connect to the AP", hostelCat, "Alice", Priority.HIGH);
        sampleIssue.setId(10L);
        sampleIssue.setStatus(IssueStatus.OPEN);
    }

    @Test
    @DisplayName("Legal move: OPEN -> IN_PROGRESS succeeds")
    void testLegalMoveOpenToInProgress() {
        sampleIssue.setStatus(IssueStatus.OPEN);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponse response = issueService.changeStatus(10L, IssueStatus.IN_PROGRESS);

        assertThat(response.status()).isEqualTo(IssueStatus.IN_PROGRESS);
        assertThat(sampleIssue.getStatus()).isEqualTo(IssueStatus.IN_PROGRESS);
        verify(issueRepository).save(sampleIssue);
    }

    @Test
    @DisplayName("Legal move: IN_PROGRESS -> RESOLVED succeeds")
    void testLegalMoveInProgressToResolved() {
        sampleIssue.setStatus(IssueStatus.IN_PROGRESS);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponse response = issueService.changeStatus(10L, IssueStatus.RESOLVED);

        assertThat(response.status()).isEqualTo(IssueStatus.RESOLVED);
        assertThat(sampleIssue.getStatus()).isEqualTo(IssueStatus.RESOLVED);
        verify(issueRepository).save(sampleIssue);
    }

    @Test
    @DisplayName("Legal move: RESOLVED -> OPEN (reopen) succeeds")
    void testLegalMoveResolvedToOpen() {
        sampleIssue.setStatus(IssueStatus.RESOLVED);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueResponse response = issueService.changeStatus(10L, IssueStatus.OPEN);

        assertThat(response.status()).isEqualTo(IssueStatus.OPEN);
        assertThat(sampleIssue.getStatus()).isEqualTo(IssueStatus.OPEN);
        verify(issueRepository).save(sampleIssue);
    }

    @Test
    @DisplayName("Illegal move: OPEN -> RESOLVED throws IllegalTransitionException")
    void testIllegalMoveOpenToResolvedThrows() {
        sampleIssue.setStatus(IssueStatus.OPEN);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));

        assertThatThrownBy(() -> issueService.changeStatus(10L, IssueStatus.RESOLVED))
                .isInstanceOf(IllegalTransitionException.class)
                .hasMessageContaining("Cannot transition issue status from OPEN to RESOLVED");

        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("Illegal move: RESOLVED -> IN_PROGRESS throws IllegalTransitionException")
    void testIllegalMoveResolvedToInProgressThrows() {
        sampleIssue.setStatus(IssueStatus.RESOLVED);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));

        assertThatThrownBy(() -> issueService.changeStatus(10L, IssueStatus.IN_PROGRESS))
                .isInstanceOf(IllegalTransitionException.class)
                .hasMessageContaining("Cannot transition issue status from RESOLVED to IN_PROGRESS");

        verify(issueRepository, never()).save(any());
    }

    @Test
    @DisplayName("Missing issue id throws IssueNotFoundException")
    void testMissingIdThrows() {
        when(issueRepository.findByIdWithCategory(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> issueService.changeStatus(999L, IssueStatus.IN_PROGRESS))
                .isInstanceOf(IssueNotFoundException.class)
                .hasMessageContaining("Issue not found with id: 999");

        assertThatThrownBy(() -> issueService.getIssueById(999L))
                .isInstanceOf(IssueNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    @DisplayName("Create issue succeeds and defaults to OPEN")
    void testCreateIssue() {
        IssueRequest request = new IssueRequest("Water leak in lab", "Floor is flooded", 1, Priority.HIGH, "Bob");
        when(categoryRepository.findById(1)).thenReturn(Optional.of(hostelCat));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> {
            Issue issue = invocation.getArgument(0);
            issue.setId(101L);
            return issue;
        });

        IssueResponse response = issueService.createIssue(request);

        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.title()).isEqualTo("Water leak in lab");
        assertThat(response.status()).isEqualTo(IssueStatus.OPEN);
        assertThat(response.categoryName()).isEqualTo("Hostel");
    }

    @Test
    @DisplayName("Update issue updates fields but preserves existing status")
    void testUpdateIssuePreservesStatus() {
        sampleIssue.setStatus(IssueStatus.IN_PROGRESS);
        when(issueRepository.findByIdWithCategory(10L)).thenReturn(Optional.of(sampleIssue));
        when(categoryRepository.findById(1)).thenReturn(Optional.of(hostelCat));
        when(issueRepository.save(any(Issue.class))).thenAnswer(invocation -> invocation.getArgument(0));

        IssueRequest updateReq = new IssueRequest("Updated title for wifi", "New description", 1, Priority.LOW, "Alice");
        IssueResponse response = issueService.updateIssue(10L, updateReq);

        assertThat(response.title()).isEqualTo("Updated title for wifi");
        assertThat(response.priority()).isEqualTo(Priority.LOW);
        assertThat(response.status()).isEqualTo(IssueStatus.IN_PROGRESS); // Preserved!
    }

    @Test
    @DisplayName("Summary returns counts for all three statuses")
    void testGetSummary() {
        when(issueRepository.countByStatus(IssueStatus.OPEN)).thenReturn(5L);
        when(issueRepository.countByStatus(IssueStatus.IN_PROGRESS)).thenReturn(3L);
        when(issueRepository.countByStatus(IssueStatus.RESOLVED)).thenReturn(8L);

        Map<String, Long> summary = issueService.getSummary();

        assertThat(summary).containsEntry("OPEN", 5L)
                .containsEntry("IN_PROGRESS", 3L)
                .containsEntry("RESOLVED", 8L);
    }
}
