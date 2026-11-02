import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="nav-container">
        <Link to="/issues" className="brand-link" aria-label="CampusFix Home">
          <svg className="brand-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          CampusFix
        </Link>
        <div className="nav-links">
          <NavLink
            to="/issues"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Issues
          </NavLink>
          <NavLink
            to="/summary"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Summary
          </NavLink>
          <Link to="/issues/new" className="btn btn-primary" id="btn-report-issue">
            + Report Issue
          </Link>
        </div>
      </div>
    </nav>
  );
}
