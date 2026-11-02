import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'open';
  const label = status ? status.replace('_', ' ') : 'OPEN';

  return (
    <span className={`badge badge-${normalized}`}>
      {label}
    </span>
  );
}
