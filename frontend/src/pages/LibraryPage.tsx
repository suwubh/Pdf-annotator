import React from 'react';
import Layout from '../components/common/Layout';
import PDFLibrary from '../components/dashboard/PDFLibrary';

const LibraryPage: React.FC = () => {
  return (
    <Layout title="PDF Library">
      <PDFLibrary />
    </Layout>
  );
};

export default LibraryPage;
