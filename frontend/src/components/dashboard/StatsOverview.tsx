import React from 'react';
import styled from 'styled-components';
import { FileText, Eye, Calendar } from 'lucide-react';
import { Card } from '../../styles/GlobalStyle';
import { isThisMonth } from '../../utils/dateUtils';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  border-left: 4px solid var(--primary-color);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
`;

const StatIcon = styled.div`
  color: var(--primary-color);
  opacity: 0.7;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const StatDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

interface StatsOverviewProps {
  pdfs: any[];
  recentViewCount: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ pdfs, recentViewCount }) => {
  const thisMonthUploads = pdfs.filter(pdf => {
    const uploadDate = pdf.createdAt || pdf.uploadedAt || pdf.uploadDate;
    console.log('StatsOverview: Checking date for this month:', uploadDate, isThisMonth(uploadDate));
    return isThisMonth(uploadDate);
  }).length;

  const totalPdfs = pdfs.length;

  console.log('StatsOverview calculations:', { totalPdfs, thisMonthUploads, recentViewCount });

  return (
    <StatsGrid>
      <StatCard>
        <StatHeader>
          <StatTitle>Total PDFs</StatTitle>
          <StatIcon>
            <FileText size={20} />
          </StatIcon>
        </StatHeader>
        <StatValue>{totalPdfs}</StatValue>
        <StatDescription>All uploaded documents</StatDescription>
      </StatCard>

      <StatCard>
        <StatHeader>
          <StatTitle>This Month</StatTitle>
          <StatIcon>
            <Calendar size={20} />
          </StatIcon>
        </StatHeader>
        <StatValue>{thisMonthUploads}</StatValue>
        <StatDescription>Uploaded this month</StatDescription>
      </StatCard>

      <StatCard>
        <StatHeader>
          <StatTitle>Recently Viewed</StatTitle>
          <StatIcon>
            <Eye size={20} />
          </StatIcon>
        </StatHeader>
        <StatValue>{recentViewCount}</StatValue>
        <StatDescription>Viewed in last 7 days</StatDescription>
      </StatCard>
    </StatsGrid>
  );
};

export default StatsOverview;
