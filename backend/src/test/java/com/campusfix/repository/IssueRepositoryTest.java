package com.campusfix.repository;

import com.campusfix.model.Category;
import com.campusfix.model.Issue;
import com.campusfix.model.IssueStatus;
import com.campusfix.model.Priority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class IssueRepositoryTest {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Category hostelCat;
    private Category networkCat;

    @BeforeEach
    void setUp() {
        issueRepository.deleteAll();

        // Seed or find categories created by Flyway
        hostelCat = categoryRepository.findByNameIgnoreCase("Hostel")
                .orElseGet(() -> categoryRepository.save(new Category("Hostel")));
        networkCat = categoryRepository.findByNameIgnoreCase("Network")
                .orElseGet(() -> categoryRepository.save(new Category("Network")));

        // Create sample issues
        Issue i1 = new Issue("Wi-Fi down in Hostel A", "Signal drops constantly", networkCat, "Alice", Priority.HIGH);
        i1.setStatus(IssueStatus.OPEN);
        entityManager.persist(i1);

        Issue i2 = new Issue("Broken water tap in Hostel B", "Tap is leaking water", hostelCat, "Bob", Priority.MEDIUM);
        i2.setStatus(IssueStatus.IN_PROGRESS);
        entityManager.persist(i2);

        Issue i3 = new Issue("Wi-Fi router replacement in Lab", "Done replacing router", networkCat, "Charlie", Priority.LOW);
        i3.setStatus(IssueStatus.RESOLVED);
        entityManager.persist(i3);

        Issue i4 = new Issue("Hostel door lock damaged", "Lock is jammed", hostelCat, "Dave", Priority.HIGH);
        i4.setStatus(IssueStatus.OPEN);
        entityManager.persist(i4);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Should filter issues by status")
    void testFilterByStatus() {
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Issue> openIssues = issueRepository.searchIssues(IssueStatus.OPEN, null, pageRequest);
        assertThat(openIssues.getContent()).hasSize(2);
        assertThat(openIssues.getContent()).allMatch(i -> i.getStatus() == IssueStatus.OPEN);

        Page<Issue> resolvedIssues = issueRepository.searchIssues(IssueStatus.RESOLVED, null, pageRequest);
        assertThat(resolvedIssues.getContent()).hasSize(1);
        assertThat(resolvedIssues.getContent().get(0).getTitle()).isEqualTo("Wi-Fi router replacement in Lab");
    }

    @Test
    @DisplayName("Should search issues by title case-insensitively")
    void testSearchByTitleCaseInsensitive() {
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Searching "wi-fi" in lowercase
        Page<Issue> wifiIssues = issueRepository.searchIssues(null, "wi-fi", pageRequest);
        assertThat(wifiIssues.getContent()).hasSize(2);
        assertThat(wifiIssues.getContent()).extracting(Issue::getTitle)
                .containsExactlyInAnyOrder("Wi-Fi down in Hostel A", "Wi-Fi router replacement in Lab");

        // Searching "WATER" in uppercase
        Page<Issue> waterIssues = issueRepository.searchIssues(null, "WATER", pageRequest);
        assertThat(waterIssues.getContent()).hasSize(1);
        assertThat(waterIssues.getContent().get(0).getTitle()).contains("water tap");
    }

    @Test
    @DisplayName("Should handle paging properly")
    void testPaging() {
        // Page 0 with size 2
        PageRequest page0 = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Issue> resultPage0 = issueRepository.searchIssues(null, null, page0);

        assertThat(resultPage0.getTotalElements()).isEqualTo(4);
        assertThat(resultPage0.getTotalPages()).isEqualTo(2);
        assertThat(resultPage0.getContent()).hasSize(2);

        // Page 1 with size 2
        PageRequest page1 = PageRequest.of(1, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Issue> resultPage1 = issueRepository.searchIssues(null, null, page1);

        assertThat(resultPage1.getContent()).hasSize(2);
        assertThat(resultPage1.getNumber()).isEqualTo(1);
    }
}
