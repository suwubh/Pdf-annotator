import React from 'react';
import Layout from '../components/common/Layout';
import PDFUpload from '../components/pdf/PDFUpload';

const UploadPage: React.FC = () => {
  return (
    <Layout title="Upload PDF">
      <PDFUpload />
    </Layout>
  );
};

export default UploadPage;
