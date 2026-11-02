import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    const fetchIssue = async () => {
      try {
        const res = await api.get(`/api/issues/${id}`);
        if (isCurrent) {
          setIssue(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.response?.data?.message || 'Failed to load issue');
          setLoading(false);
        }
      }
    };

    fetchIssue();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  // Determine the ONE permitted next status according to business rules:
  // OPEN -> IN_PROGRESS, IN_PROGRESS -> RESOLVED, RESOLVED -> OPEN
  const getNextStatusAction = () => {
    if (!issue) return null;
    switch (issue.status) {
      case 'OPEN':
        return {
          target: 'IN_PROGRESS',
          label: 'Start Progress',
          btnClass: 'btn-primary'
        };
      case 'IN_PROGRESS':
        return {
          target: 'RESOLVED',
          label: 'Mark as Resolved',
          btnClass: 'btn-success'
        };
      case 'RESOLVED':
        return {
          target: 'OPEN',
          label: 'Reopen Issue',
          btnClass: 'btn-warning'
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  const handleStatusTransition = async () => {
    if (!nextAction || actionLoading) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await api.patch(`/api/issues/${id}/status`, {
        status: nextAction.target
      });
      setIssue(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setError(null);

    try {
      await api.delete(`/api/issues/${id}`);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue');
      setShowDeleteModal(false);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container" aria-live="polite">
        <div className="loading-container">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading issue details...</p>
        </div>
      </main>
    );
  }

  if (error && !issue) {
    return (
      <main className="container">
        <div className="alert alert-error" role="alert">
          <strong>Error:</strong> {error}
        </div>
        <Link to="/issues" className="btn btn-secondary">
          &larr; Back to Issues List
        </Link>
      </main>
    );
  }

  return (
    <main className="container" aria-labelledby="issue-detail-heading">
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/issues" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem' }}>
          &larr; Back to Issues
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {issue && (
        <article className="detail-card">
          <header className="detail-header">
            <div>
              <h1 id="issue-detail-heading" className="detail-title">{issue.title}</h1>
              <small style={{ color: 'var(--text-muted)' }}>Issue #{issue.id}</small>
            </div>
            <div className="detail-badges">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>
          </header>

          <section className="detail-meta-grid" aria-label="Issue metadata">
            <div>
              <div className="meta-item-label">Category</div>
              <div className="meta-item-value">{issue.categoryName || 'N/A'}</div>
            </div>
            <div>
              <div className="meta-item-label">Reporter</div>
              <div className="meta-item-value">{issue.reporterName}</div>
            </div>
            <div>
              <div className="meta-item-label">Created At</div>
              <div className="meta-item-value">
                {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <div className="meta-item-label">Last Updated</div>
              <div className="meta-item-value">
                {issue.updatedAt ? new Date(issue.updatedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 className="detail-desc-title">Description</h2>
            <div className="detail-desc-content">{issue.description}</div>
          </section>

          {/* Action Panel: ONE next permitted status button, Edit, Delete */}
          <footer className="detail-actions-panel">
            <div>
              {nextAction && (
                <button
                  type="button"
                  className={`btn ${nextAction.btnClass}`}
                  onClick={handleStatusTransition}
                  disabled={actionLoading}
                  id="btn-next-status"
                >
                  {actionLoading ? 'Updating...' : `→ ${nextAction.label}`}
                </button>
              )}
            </div>

            <div className="action-group">
              <Link to={`/issues/${issue.id}/edit`} className="btn btn-secondary">
                Edit Issue
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
                id="btn-delete-issue"
              >
                Delete Issue
              </button>
            </div>
          </footer>
        </article>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <h2 id="modal-title" className="modal-title">Confirm Delete</h2>
            <p className="modal-body">
              Are you sure you want to permanently delete issue <strong>"{issue?.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={actionLoading}
                id="btn-confirm-delete"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
