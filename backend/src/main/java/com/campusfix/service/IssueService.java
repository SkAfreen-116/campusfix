package com.campusfix.service;

import com.campusfix.dto.CategoryResponse;
import com.campusfix.dto.IssueRequest;
import com.campusfix.dto.IssueResponse;
import com.campusfix.exception.CategoryNotFoundException;
import com.campusfix.exception.IllegalTransitionException;
import com.campusfix.exception.IssueNotFoundException;
import com.campusfix.model.Category;
import com.campusfix.model.Issue;
import com.campusfix.model.IssueStatus;
import com.campusfix.repository.CategoryRepository;
import com.campusfix.repository.IssueRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final CategoryRepository categoryRepository;

    public IssueService(IssueRepository issueRepository, CategoryRepository categoryRepository) {
        this.issueRepository = issueRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<IssueResponse> getIssues(IssueStatus status, String q, Pageable pageable) {
        // Default sort is createdAt desc if not specified
        Pageable resolvedPageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            resolvedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        String search = (q != null && !q.isBlank()) ? q.trim() : null;
        return issueRepository.searchIssues(status, search, resolvedPageable)
                .map(IssueResponse::from);
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id) {
        Issue issue = issueRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new IssueNotFoundException(id));
        return IssueResponse.from(issue);
    }

    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        Issue issue = new Issue(
                request.title().trim(),
                request.description().trim(),
                category,
                request.reporterName().trim(),
                request.priority()
        );

        Issue saved = issueRepository.save(issue);
        return IssueResponse.from(saved);
    }

    @Transactional
    public IssueResponse updateIssue(Long id, IssueRequest request) {
        Issue issue = issueRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new IssueNotFoundException(id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        issue.setTitle(request.title().trim());
        issue.setDescription(request.description().trim());
        issue.setCategory(category);
        issue.setReporterName(request.reporterName().trim());
        issue.setPriority(request.priority());
        // Status is explicitly NOT editable here

        Issue updated = issueRepository.save(issue);
        return IssueResponse.from(updated);
    }

    @Transactional
    public IssueResponse changeStatus(Long id, IssueStatus targetStatus) {
        Issue issue = issueRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new IssueNotFoundException(id));

        validateStatusTransition(issue.getStatus(), targetStatus);

        issue.setStatus(targetStatus);
        Issue updated = issueRepository.save(issue);
        return IssueResponse.from(updated);
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IssueNotFoundException(id));
        issueRepository.delete(issue);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getSummary() {
        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put(IssueStatus.OPEN.name(), issueRepository.countByStatus(IssueStatus.OPEN));
        summary.put(IssueStatus.IN_PROGRESS.name(), issueRepository.countByStatus(IssueStatus.IN_PROGRESS));
        summary.put(IssueStatus.RESOLVED.name(), issueRepository.countByStatus(IssueStatus.RESOLVED));
        return summary;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    /**
     * Validates that the requested status change conforms to the business rules:
     * OPEN -> IN_PROGRESS
     * IN_PROGRESS -> RESOLVED
     * RESOLVED -> OPEN
     */
    void validateStatusTransition(IssueStatus current, IssueStatus target) {
        if (current == null || target == null) {
            throw new IllegalTransitionException("Current and target status must not be null");
        }

        boolean allowed = switch (current) {
            case OPEN -> target == IssueStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == IssueStatus.RESOLVED;
            case RESOLVED -> target == IssueStatus.OPEN;
        };

        if (!allowed) {
            throw new IllegalTransitionException(current, target);
        }
    }
}
