import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Summary() {
  const [summary, setSummary] = useState({
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    const fetchSummary = async () => {
      try {
        const res = await api.get('/api/issues/summary');
        if (isCurrent) {
          setSummary({
            OPEN: res.data.OPEN ?? 0,
            IN_PROGRESS: res.data.IN_PROGRESS ?? 0,
            RESOLVED: res.data.RESOLVED ?? 0
          });
          setLoading(false);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.response?.data?.message || 'Failed to load summary');
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isCurrent = false;
    };
  }, []);

  const total = (summary.OPEN || 0) + (summary.IN_PROGRESS || 0) + (summary.RESOLVED || 0);

  return (
    <main className="container" aria-labelledby="summary-heading">
      <header className="page-header">
        <div>
          <h1 id="summary-heading" className="page-title">Campus Issues Summary</h1>
          <p className="page-description">Overview of campus maintenance and issue statuses.</p>
        </div>
        <Link to="/issues" className="btn btn-secondary">
          View All Issues
        </Link>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Calculating issue statistics...</p>
        </div>
      ) : (
        <>
          <div className="summary-grid" data-testid="summary-cards">
            {/* Open card */}
            <article className="summary-card summary-card-open" data-testid="card-open">
              <span className="summary-label">Open Issues</span>
              <div className="summary-count" data-testid="count-open">{summary.OPEN}</div>
              <p className="summary-helper">Awaiting investigation or technician assignment</p>
            </article>

            {/* In Progress card */}
            <article className="summary-card summary-card-progress" data-testid="card-progress">
              <span className="summary-label">In Progress</span>
              <div className="summary-count" data-testid="count-progress">{summary.IN_PROGRESS}</div>
              <p className="summary-helper">Actively being repaired or investigated</p>
            </article>

            {/* Resolved card */}
            <article className="summary-card summary-card-resolved" data-testid="card-resolved">
              <span className="summary-label">Resolved</span>
              <div className="summary-count" data-testid="count-resolved">{summary.RESOLVED}</div>
              <p className="summary-helper">Fixed and verified by campus staff</p>
            </article>
          </div>

          <section style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Total recorded campus issues: <strong>{total}</strong></p>
          </section>
        </>
      )}
    </main>
  );
}
