import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'MEDIUM',
    reporterName: ''
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const loadData = async () => {
      try {
        const [catRes, issueRes] = await Promise.all([
          api.get('/api/categories'),
          api.get(`/api/issues/${id}`)
        ]);

        if (isCurrent) {
          setCategories(catRes.data);
          const issue = issueRes.data;
          setFormData({
            title: issue.title || '',
            description: issue.description || '',
            categoryId: issue.categoryId || (catRes.data[0]?.id ?? ''),
            priority: issue.priority || 'MEDIUM',
            reporterName: issue.reporterName || ''
          });
          setLoading(false);
        }
      } catch (err) {
        if (isCurrent) {
          setGeneralError(err.response?.data?.message || 'Failed to load issue details');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: Number(formData.categoryId),
        priority: formData.priority,
        reporterName: formData.reporterName
      };

      await api.put(`/api/issues/${id}`, payload);
      navigate(`/issues/${id}`);
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, fields } = err.response.data;
        if (fields && Object.keys(fields).length > 0) {
          setFieldErrors(fields);
        }
        setGeneralError(message || 'Failed to update issue');
      } else {
        setGeneralError(err.message || 'Network error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container" aria-live="polite">
        <div className="loading-container">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading issue to edit...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" aria-labelledby="edit-form-heading">
      <div className="form-card">
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 id="edit-form-heading" className="page-title">Edit Issue #{id}</h1>
          <p className="page-description">Update title, description, category, or priority.</p>
        </header>

        {generalError && (
          <div className="alert alert-error" role="alert">
            <strong>Error:</strong> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Issue Title <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-control ${fieldErrors.title ? 'input-error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            />
            {fieldErrors.title && (
              <p id="title-error" className="field-error" role="alert">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${fieldErrors.description ? 'input-error' : ''}`}
              value={formData.description}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.description}
              aria-describedby={fieldErrors.description ? 'description-error' : undefined}
            />
            {fieldErrors.description && (
              <p id="description-error" className="field-error" role="alert">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="categoryId" className="form-label">
              Category <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className={`form-control ${fieldErrors.categoryId ? 'input-error' : ''}`}
              value={formData.categoryId}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.categoryId}
              aria-describedby={fieldErrors.categoryId ? 'categoryId-error' : undefined}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p id="categoryId-error" className="field-error" role="alert">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority" className="form-label">
              Priority <span className="required" aria-hidden="true">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              className={`form-control ${fieldErrors.priority ? 'input-error' : ''}`}
              value={formData.priority}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.priority}
              aria-describedby={fieldErrors.priority ? 'priority-error' : undefined}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            {fieldErrors.priority && (
              <p id="priority-error" className="field-error" role="alert">
                {fieldErrors.priority}
              </p>
            )}
          </div>

          {/* Reporter Name */}
          <div className="form-group">
            <label htmlFor="reporterName" className="form-label">
              Your Name (Reporter) <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="reporterName"
              name="reporterName"
              type="text"
              className={`form-control ${fieldErrors.reporterName ? 'input-error' : ''}`}
              value={formData.reporterName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.reporterName}
              aria-describedby={fieldErrors.reporterName ? 'reporterName-error' : undefined}
            />
            {fieldErrors.reporterName && (
              <p id="reporterName-error" className="field-error" role="alert">
                {fieldErrors.reporterName}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Link to={`/issues/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
