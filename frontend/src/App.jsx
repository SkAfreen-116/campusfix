import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import IssuesList from './pages/IssuesList';
import CreateIssue from './pages/CreateIssue';
import IssueDetail from './pages/IssueDetail';
import EditIssue from './pages/EditIssue';
import Summary from './pages/Summary';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/issues" replace />} />
        <Route path="/issues" element={<IssuesList />} />
        <Route path="/issues/new" element={<CreateIssue />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/issues/:id/edit" element={<EditIssue />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="*" element={<Navigate to="/issues" replace />} />
      </Routes>
    </>
  );
}
