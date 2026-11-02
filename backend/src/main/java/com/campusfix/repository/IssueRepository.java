package com.campusfix.repository;

import com.campusfix.model.Issue;
import com.campusfix.model.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    @Query(
        value = """
            SELECT i FROM Issue i JOIN FETCH i.category c
            WHERE (:status IS NULL OR i.status = :status)
              AND (:q IS NULL OR :q = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :q, '%')))
        """,
        countQuery = """
            SELECT COUNT(i) FROM Issue i
            WHERE (:status IS NULL OR i.status = :status)
              AND (:q IS NULL OR :q = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :q, '%')))
        """
    )
    Page<Issue> searchIssues(
        @Param("status") IssueStatus status,
        @Param("q") String q,
        Pageable pageable
    );

    @Query("SELECT i FROM Issue i JOIN FETCH i.category c WHERE i.id = :id")
    Optional<Issue> findByIdWithCategory(@Param("id") Long id);

    long countByStatus(IssueStatus status);
}
