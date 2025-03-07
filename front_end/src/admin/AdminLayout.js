import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default AdminLayout;