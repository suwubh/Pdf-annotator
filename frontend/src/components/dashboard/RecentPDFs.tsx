import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FileText, Eye, Upload } from 'lucide-react';
import { Card, Button } from '../../styles/GlobalStyle';
import { formatDate, formatFileSize } from '../../utils/dateUtils';

const RecentSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const PDFList = styled.div`
  display: grid;
  gap: 1rem;
`;

const PDFItem = styled(Card)`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }
`;

const PDFIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const PDFInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PDFName = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PDFMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: var(--background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
`;

interface RecentPDFsProps {
  pdfs: any[];
}

const RecentPDFs: React.FC<RecentPDFsProps> = ({ pdfs }) => {
  const navigate = useNavigate();

  if (pdfs.length === 0) {
    return (
      <RecentSection>
        <SectionTitle>Recent PDFs</SectionTitle>
        <EmptyState>
          <EmptyIcon>
            <FileText size={24} />
          </EmptyIcon>
          <h3>No PDFs uploaded yet</h3>
          <p>Upload your first PDF to get started!</p>
          <Button onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload PDF
          </Button>
        </EmptyState>
      </RecentSection>
    );
  }

  return (
    <RecentSection>
      <SectionHeader>
        <SectionTitle>Recent PDFs</SectionTitle>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/library')}
        >
          View All
        </Button>
      </SectionHeader>

      <PDFList>
        {pdfs.map((pdf) => (
          <PDFItem
            key={pdf.uuid}
            onClick={() => navigate(`/pdf/${pdf.uuid}`)}
          >
            <PDFIcon>
              <FileText size={20} />
            </PDFIcon>

            <PDFInfo>
              <PDFName title={pdf.originalName}>
                {pdf.originalName}
              </PDFName>
              <PDFMeta>
                <span>{formatFileSize(pdf.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(pdf.createdAt || pdf.uploadedAt || pdf.uploadDate)}</span>
                {pdf.totalPages > 0 && (
                  <>
                    <span>•</span>
                    <span>{pdf.totalPages} pages</span>
                  </>
                )}
              </PDFMeta>
            </PDFInfo>

            <ViewButton
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/pdf/${pdf.uuid}`);
              }}
            >
              <Eye size={14} />
              View
            </ViewButton>
          </PDFItem>
        ))}
      </PDFList>
    </RecentSection>
  );
};

export default RecentPDFs;
