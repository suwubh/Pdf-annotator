import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--background);
`;

const Spinner = styled.div`
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-left: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <SpinnerContainer>
      <Spinner />
      <LoadingText>{text}</LoadingText>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
