// src/components/dashboard/PDFLibrary.tsx (Complete Fixed Version)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FileText,
  Search,
  Grid,
  List,
  Eye,
  Trash2,
  Calendar,
  HardDrive,
  Upload
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pdfService } from '../../services/pdf';
import { Button, Card, Container } from '../../styles/GlobalStyle';
import { PDF } from '../../types';
import { formatDate, formatFileSize, isThisMonth } from '../../utils/dateUtils';

const LibraryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    outline: none;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: ${({ active }) => active ? 'var(--primary-color)' : 'var(--surface)'};
  color: ${({ active }) => active ? 'white' : 'var(--text-secondary)'};

  &:hover {
    background: ${({ active }) => active ? 'var(--primary-hover)' : 'var(--background)'};
  }
`;

const LibraryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  background: ${({ color }) => color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div``;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const PDFGrid = styled.div<{ viewMode: 'grid' | 'list' }>`
  display: grid;
  gap: 1rem;
  grid-template-columns: ${({ viewMode }) =>
    viewMode === 'grid'
      ? 'repeat(auto-fill, minmax(280px, 1fr))'
      : '1fr'
  };
`;

const PDFCard = styled(Card)<{ viewMode: 'grid' | 'list' }>`
  display: flex;
  flex-direction: ${({ viewMode }) => viewMode === 'grid' ? 'column' : 'row'};
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
`;

const PDFIconContainer = styled.div<{ viewMode: 'grid' | 'list' }>`
  width: ${({ viewMode }) => viewMode === 'grid' ? '60px' : '48px'};
  height: ${({ viewMode }) => viewMode === 'grid' ? '60px' : '48px'};
  background: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: ${({ viewMode }) => viewMode === 'grid' ? '0 auto 1rem' : '0 1rem 0 0'};
  flex-shrink: 0;
`;

const PDFContent = styled.div<{ viewMode: 'grid' | 'list' }>`
  flex: 1;
  text-align: ${({ viewMode }) => viewMode === 'grid' ? 'center' : 'left'};
  min-width: 0;
`;

const PDFName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PDFMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const PDFDate = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const PDFActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${PDFCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
`;

const PDFLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pdfsData, isLoading, error } = useQuery({
    queryKey: ['user-pdfs'],
    queryFn: pdfService.getUserPDFs,
  });

  const deleteMutation = useMutation({
    mutationFn: pdfService.deletePDF,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-pdfs'] });
      toast.success('PDF deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete PDF');
    },
  });

  const pdfs = pdfsData?.pdfs || [];

  // Filter PDFs based on search query
  const filteredPDFs = pdfs.filter(pdf =>
    pdf.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FIXED: Calculate stats with proper date handling
  const totalSize = pdfs.reduce((sum, pdf) => sum + pdf.fileSize, 0);
  
  // FIXED: Use correct date field and utility function
  const thisMonthCount = pdfs.filter(pdf => {
    // Use createdAt from timestamps (your backend model has timestamps: true)
    const dateField = pdf.createdAt || pdf.uploadedAt || pdf.uploadDate;
    return isThisMonth(dateField);
  }).length;

  const handleDeletePDF = (pdf: PDF, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${pdf.originalName}"?`)) {
      deleteMutation.mutate(pdf.uuid);
    }
  };

  const stats = [
    {
      icon: FileText,
      label: 'Total PDFs',
      value: pdfs.length.toString(),
      color: 'var(--primary-color)',
    },
    {
      icon: HardDrive,
      label: 'Storage Used',
      value: formatFileSize(totalSize),
      color: 'var(--success-color)',
    },
    {
      icon: Calendar,
      label: 'This Month',
      value: thisMonthCount.toString(),
      color: 'var(--warning-color)',
    },
  ];

  if (isLoading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading your PDF library...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <LibraryHeader>
        <SearchContainer>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <ViewControls>
          <ViewButton
            active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </ViewButton>
          <ViewButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </ViewButton>
        </ViewControls>

        <Button onClick={() => navigate('/upload')}>
          <Upload size={16} />
          Upload PDF
        </Button>
      </LibraryHeader>

      {pdfs.length > 0 && (
        <LibraryStats>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatIcon color={stat.color}>
                <stat.icon size={20} />
              </StatIcon>
              <StatContent>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatContent>
            </StatCard>
          ))}
        </LibraryStats>
      )}

      {filteredPDFs.length === 0 && searchQuery && (
        <EmptyState>
          <EmptyIcon>
            <Search size={32} />
          </EmptyIcon>
          <h3>No PDFs found</h3>
          <p>No PDFs match your search query "{searchQuery}"</p>
        </EmptyState>
      )}

      {pdfs.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <FileText size={32} />
          </EmptyIcon>
          <h3>No PDFs uploaded yet</h3>
          <p>Upload your first PDF to start annotating and highlighting content.</p>
          <Button
            onClick={() => navigate('/upload')}
            style={{ marginTop: '1rem' }}
          >
            <Upload size={16} />
            Upload PDF
          </Button>
        </EmptyState>
      )}

      {filteredPDFs.length > 0 && (
        <PDFGrid viewMode={viewMode}>
          {filteredPDFs.map((pdf) => (
            <PDFCard
              key={pdf.uuid}
              viewMode={viewMode}
              onClick={() => navigate(`/pdf/${pdf.uuid}`)}
            >
              <PDFIconContainer viewMode={viewMode}>
                <FileText size={viewMode === 'grid' ? 24 : 20} />
              </PDFIconContainer>

              <PDFContent viewMode={viewMode}>
                <PDFName title={pdf.originalName}>
                  {pdf.originalName}
                </PDFName>

                <PDFMeta>
                  <span>{formatFileSize(pdf.fileSize)}</span>
                  <span>•</span>
                  {/* FIXED: Use proper date formatting with fallback */}
                  <PDFDate>
                    {formatDate(pdf.createdAt || pdf.uploadedAt || pdf.uploadDate)}
                  </PDFDate>
                  {pdf.totalPages > 0 && (
                    <>
                      <span>•</span>
                      <span>{pdf.totalPages} pages</span>
                    </>
                  )}
                </PDFMeta>

                <PDFActions>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/pdf/${pdf.uuid}`);
                    }}
                    title="View PDF"
                  >
                    <Eye size={14} />
                  </ActionButton>

                  <ActionButton
                    onClick={(e) => handleDeletePDF(pdf, e)}
                    title="Delete PDF"
                    style={{ color: '#ff4444' }}
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                </PDFActions>
              </PDFContent>
            </PDFCard>
          ))}
        </PDFGrid>
      )}
    </Container>
  );
};

export default PDFLibrary;
