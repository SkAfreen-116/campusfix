import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CreateIssue from '../CreateIssue';
import api from '../../api/client';

vi.mock('../../api/client');

describe('CreateIssue Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an API field error beside input when the backend returns 400 validation error', async () => {
    // Mock category fetch
    api.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Hostel' }, { id: 2, name: 'Laboratory' }]
    });

    // Mock API 400 error on POST
    const errorResponse = {
      response: {
        status: 400,
        data: {
          status: 400,
          message: 'Validation failed for request',
          fields: {
            title: 'Title must be between 5 and 120 characters'
          }
        }
      }
    };
    api.post.mockRejectedValueOnce(errorResponse);

    render(
      <BrowserRouter>
        <CreateIssue />
      </BrowserRouter>
    );

    // Fill in a title that is too short
    const titleInput = screen.getByLabelText(/Issue Title/i);
    const descInput = screen.getByLabelText(/Description/i);
    const reporterInput = screen.getByLabelText(/Your Name \(Reporter\)/i);
    const submitBtn = screen.getByRole('button', { name: /Submit Issue/i });

    await userEvent.type(titleInput, 'Bad');
    await userEvent.type(descInput, 'Some valid description text');
    await userEvent.type(reporterInput, 'Alice');

    await userEvent.click(submitBtn);

    // Expect the API field error to be displayed beside the title input
    await waitFor(() => {
      const errorElem = screen.getByTestId('error-title');
      expect(errorElem).toBeInTheDocument();
      expect(errorElem).toHaveTextContent('Title must be between 5 and 120 characters');
      expect(errorElem).toHaveAttribute('role', 'alert');
    });

    // Input should also have aria-invalid set to true
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
  });
});
