// src/pages/DashboardPage.tsx
import React from 'react';
import Layout from '../components/common/Layout';
import Dashboard from '../components/dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <Dashboard />
    </Layout>
  );
};

export default DashboardPage;
