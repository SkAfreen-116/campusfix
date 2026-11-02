import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IssuesList from '../IssuesList';
import api from '../../api/client';

vi.mock('../../api/client');

describe('IssuesList Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no issues are returned from the API', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0
      }
    });

    render(
      <BrowserRouter>
        <IssuesList />
      </BrowserRouter>
    );

    // Initial loading state
    expect(screen.getByText(/Loading campus issues.../i)).toBeInTheDocument();

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('No issues found')).toBeInTheDocument();
    expect(screen.getByText('Report a New Issue')).toBeInTheDocument();
  });

  it('renders issue cards when issues exist', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 1,
            title: 'Water leak in Hostel 2',
            description: 'First floor bathroom tap is broken',
            categoryId: 1,
            categoryName: 'Hostel',
            priority: 'HIGH',
            status: 'OPEN',
            reporterName: 'John',
            createdAt: '2026-10-30T10:00:00Z'
          }
        ],
        totalPages: 1,
        totalElements: 1,
        number: 0
      }
    });

    render(
      <BrowserRouter>
        <IssuesList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Water leak in Hostel 2')).toBeInTheDocument();
    });

    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Hostel')).toBeInTheDocument();
  });
});
