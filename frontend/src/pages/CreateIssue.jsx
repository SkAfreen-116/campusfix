import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function CreateIssue() {
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            categoryId: prev.categoryId || res.data[0].id
          }));
        }
      } catch (err) {
        setGeneralError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear field-level error when user starts modifying the field
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

      const res = await api.post('/api/issues', payload);
      navigate(`/issues/${res.data.id}`);
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, fields } = err.response.data;
        if (fields && Object.keys(fields).length > 0) {
          setFieldErrors(fields);
        }
        setGeneralError(message || 'Failed to create issue');
      } else {
        setGeneralError(err.message || 'Network error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container" aria-labelledby="form-heading">
      <div className="form-card">
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 id="form-heading" className="page-title">Report Campus Issue</h1>
          <p className="page-description">Fill out the details below so facilities can investigate.</p>
        </header>

        {generalError && (
          <div className="alert alert-error" role="alert" data-testid="general-error">
            <strong>Error:</strong> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title input */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Issue Title <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-control ${fieldErrors.title ? 'input-error' : ''}`}
              placeholder="e.g. Wi-Fi down in Lab 3 (5-120 chars)"
              value={formData.title}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? 'title-error' : undefined}
            />
            {fieldErrors.title && (
              <p id="title-error" className="field-error" role="alert" data-testid="error-title">
                {fieldErrors.title}
              </p>
            )}
          </div>

          {/* Description input */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="required" aria-hidden="true">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-control ${fieldErrors.description ? 'input-error' : ''}`}
              placeholder="Provide specific details about the issue and location..."
              value={formData.description}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.description}
              aria-describedby={fieldErrors.description ? 'description-error' : undefined}
            />
            {fieldErrors.description && (
              <p id="description-error" className="field-error" role="alert" data-testid="error-description">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* Category input */}
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
              <p id="categoryId-error" className="field-error" role="alert" data-testid="error-categoryId">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          {/* Priority input */}
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
              <p id="priority-error" className="field-error" role="alert" data-testid="error-priority">
                {fieldErrors.priority}
              </p>
            )}
          </div>

          {/* Reporter Name input */}
          <div className="form-group">
            <label htmlFor="reporterName" className="form-label">
              Your Name (Reporter) <span className="required" aria-hidden="true">*</span>
            </label>
            <input
              id="reporterName"
              name="reporterName"
              type="text"
              className={`form-control ${fieldErrors.reporterName ? 'input-error' : ''}`}
              placeholder="e.g. Jane Smith (max 80 chars)"
              value={formData.reporterName}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!fieldErrors.reporterName}
              aria-describedby={fieldErrors.reporterName ? 'reporterName-error' : undefined}
            />
            {fieldErrors.reporterName && (
              <p id="reporterName-error" className="field-error" role="alert" data-testid="error-reporterName">
                {fieldErrors.reporterName}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/issues" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="submit-issue-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
