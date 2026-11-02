import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIssues } from '../hooks/useIssues';
import { useDebounce } from '../hooks/useDebounce';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function IssuesList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  // Debounce search input by 400ms as requested
  const debouncedQuery = useDebounce(searchInput, 400);

  const { data, loading, error } = useIssues(statusFilter, debouncedQuery, page);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(0);
  };

  const issues = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <main className="container" aria-labelledby="issues-heading">
      <header className="page-header">
        <div>
          <h1 id="issues-heading" className="page-title">Campus Issues</h1>
          <p className="page-description">Track, report, and monitor maintenance and campus facilities.</p>
        </div>
        <Link to="/issues/new" className="btn btn-primary">
          + Report Issue
        </Link>
      </header>

      {/* Filter and Debounced Search Toolbar */}
      <section className="toolbar" aria-label="Filters and Search">
        <div className="toolbar-item">
          <label htmlFor="status-filter">Filter Status:</label>
          <select
            id="status-filter"
            className="select-input"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="toolbar-item search-box">
          <label htmlFor="search-input" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
            Search issues by title
          </label>
          <input
            id="search-input"
            type="search"
            className="search-input"
            placeholder="Search by title (e.g. Wi-Fi, projector)..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="alert alert-error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-container" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading campus issues...</p>
        </div>
      ) : issues.length === 0 ? (
        /* Empty state */
        <div className="empty-state" data-testid="empty-state">
          <div className="empty-icon" aria-hidden="true">📋</div>
          <h2 className="empty-title">No issues found</h2>
          <p className="empty-desc">
            {searchInput || statusFilter
              ? 'No campus issues match your active search or filter criteria.'
              : 'There are currently no reported issues on campus. Great news!'}
          </p>
          <Link to="/issues/new" className="btn btn-primary">
            Report a New Issue
          </Link>
        </div>
      ) : (
        /* Issue cards grid */
        <>
          <div className="issues-grid" data-testid="issues-grid">
            {issues.map((issue) => (
              <article key={issue.id} className="issue-card" data-testid={`issue-card-${issue.id}`}>
                <div>
                  <div className="issue-card-header">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                  <h2 style={{ margin: 0 }}>
                    <Link to={`/issues/${issue.id}`} className="issue-card-title">
                      {issue.title}
                    </Link>
                  </h2>
                  <p className="issue-card-desc">{issue.description}</p>
                </div>

                <div>
                  <div className="issue-card-meta">
                    <span className="badge badge-category">
                      {issue.categoryName || 'General'}
                    </span>
                    <span>• Reported by <strong>{issue.reporterName || 'Anonymous'}</strong></span>
                  </div>
                  <div className="issue-card-footer">
                    <small style={{ color: 'var(--text-muted)' }}>
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ''}
                    </small>
                    <Link to={`/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}>
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination Navigation">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                aria-label="Go to previous page"
              >
                &larr; Previous
              </button>
              <span className="page-indicator" aria-live="polite">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                aria-label="Go to next page"
              >
                Next &rarr;
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
