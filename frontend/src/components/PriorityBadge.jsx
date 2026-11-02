import React from 'react';

export default function PriorityBadge({ priority }) {
  const normalized = priority ? priority.toLowerCase() : 'medium';

  return (
    <span className={`badge badge-priority-${normalized}`}>
      {priority}
    </span>
  );
}
