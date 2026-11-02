import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api/client';

export function useIssues(status, q, page) {
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const refetch = useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    const fetchIssues = async () => {
      try {
        const params = {
          page: page ?? 0,
          size: 10
        };
        if (status) {
          params.status = status;
        }
        if (q && q.trim()) {
          params.q = q.trim();
        }

        const response = await api.get('/api/issues', {
          params,
          signal: controller.signal
        });

        if (isCurrent) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return;
        }
        if (isCurrent) {
          setError(err.response?.data?.message || err.message || 'Failed to load issues');
          setLoading(false);
        }
      }
    };

    fetchIssues();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [status, q, page, reloadTrigger]);

  return { data, loading, error, refetch };
}
