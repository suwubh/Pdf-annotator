// src/components/dashboard/Dashboard.tsx (Complete Fixed Version)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FileText, Upload, Eye, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { pdfService } from '../../services/pdf';
import { Card, Button, Container } from '../../styles/GlobalStyle';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatFileSize, isThisMonth } from '../../utils/dateUtils';

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const WelcomeText = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  background: ${({ color }) => color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ActionsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`;

const ActionCard = styled(Card)`
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-lg);
  }
`;

const ActionIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  background: ${({ color }) => color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const RecentSection = styled.div``;

const RecentPDFs = styled.div`
  display: grid;
  gap: 1rem;
`;

const PDFItem = styled(Card)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--background);
    box-shadow: var(--shadow-lg);
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
`;

const PDFInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PDFName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
`;

const PDFMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: pdfsData, isLoading } = useQuery({
    queryKey: ['user-pdfs'],
    queryFn: pdfService.getUserPDFs,
  });

  const pdfs = pdfsData?.pdfs || [];
  const recentPDFs = pdfs.slice(0, 5); // Show last 5 PDFs

  // FIXED: Calculate stats with proper date handling
  const thisMonthCount = pdfs.filter(pdf => {
    // Use createdAt from your model (timestamps: true)
    const uploadDate = pdf.createdAt || pdf.uploadedAt || pdf.uploadDate;
    console.log('Dashboard: Checking date for this month:', uploadDate, isThisMonth(uploadDate));
    return isThisMonth(uploadDate);
  }).length;

  // Calculate recently viewed (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentViewCount = pdfs.filter(pdf => {
    const lastViewed = pdf.lastViewedAt || pdf.updatedAt;
    if (!lastViewed) return false;
    
    const viewDate = new Date(lastViewed);
    return !isNaN(viewDate.getTime()) && viewDate >= sevenDaysAgo;
  }).length;

  console.log('Dashboard stats:', { totalPdfs: pdfs.length, thisMonthCount, recentViewCount });

  const stats = [
    {
      icon: FileText,
      label: 'Total PDFs',
      value: pdfs.length.toString(),
      color: 'var(--primary-color)',
    },
    {
      icon: Eye,
      label: 'Recently Viewed',
      value: recentViewCount.toString(),
      color: 'var(--success-color)',
    },
    {
      icon: Calendar,
      label: 'This Month',
      value: thisMonthCount.toString(),
      color: 'var(--warning-color)',
    },
  ];

  const actions = [
    {
      icon: Upload,
      title: 'Upload New PDF',
      description: 'Add a new PDF document to start annotating and highlighting content.',
      color: 'var(--primary-color)',
      onClick: () => navigate('/upload'),
    },
    {
      icon: FileText,
      title: 'Browse Library',
      description: 'View all your uploaded PDFs and manage your document collection.',
      color: 'var(--success-color)',
      onClick: () => navigate('/library'),
    },
  ];

  return (
    <Container>
      <WelcomeSection>
        <WelcomeTitle>Welcome back, {user?.name}!</WelcomeTitle>
        <WelcomeText>Here's an overview of your PDF annotation activity.</WelcomeText>
      </WelcomeSection>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              <stat.icon size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <ActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionGrid>
          {actions.map((action, index) => (
            <ActionCard key={index} onClick={action.onClick}>
              <ActionIcon color={action.color}>
                <action.icon size={20} />
              </ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionCard>
          ))}
        </ActionGrid>
      </ActionsSection>

      {recentPDFs.length > 0 && (
        <RecentSection>
          <SectionTitle>Recent PDFs</SectionTitle>
          <RecentPDFs>
            {recentPDFs.map((pdf) => (
              <PDFItem key={pdf.uuid} onClick={() => navigate(`/pdf/${pdf.uuid}`)}>
                <PDFIcon>
                  <FileText size={20} />
                </PDFIcon>
                <PDFInfo>
                  <PDFName>{pdf.originalName}</PDFName>
                  <PDFMeta>
                    <span>{formatFileSize(pdf.fileSize)}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(pdf.createdAt || pdf.uploadedAt || pdf.uploadDate)}</span>
                  </PDFMeta>
                </PDFInfo>
              </PDFItem>
            ))}
          </RecentPDFs>
        </RecentSection>
      )}

      {!isLoading && pdfs.length === 0 && (
        <EmptyState>
          <h3>No PDFs yet</h3>
          <p>Upload your first PDF to start annotating and highlighting content.</p>
          <Button onClick={() => navigate('/upload')}>
            <Upload size={16} />
            Upload PDF
          </Button>
        </EmptyState>
      )}
    </Container>
  );
};

export default Dashboard;
