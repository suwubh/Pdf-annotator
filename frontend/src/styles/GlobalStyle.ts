import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary-color: #D97742;
    --primary-hover: #B85F2E;
    --secondary-color: #6B8E23;
    --success-color: #7CB342;
    --warning-color: #FFB74D;
    --error-color: #D9534F;
    
    --background: #FAF7F2;
    --surface: #FFF9F5;
    --border: #E5D3C5;
    
    --text-primary: #3B2F2F;
    --text-secondary: #6F4E37;
    
    --shadow: 0 1px 3px 0 rgba(149, 84, 42, 0.12);
    --shadow-lg: 0 4px 16px 0 rgba(149, 84, 42, 0.15);
    
    --hl-yellow: rgba(255, 215, 122, 0.4);
    --hl-coral: rgba(217, 119, 66, 0.35);
    --hl-green: rgba(107, 142, 35, 0.35);
    --hl-orange: rgba(255, 183, 77, 0.35);
    --hl-pink: rgba(199, 91, 122, 0.35);
    --hl-teal: rgba(72, 130, 116, 0.35);
    --hl-violet: rgba(142, 90, 150, 0.35);
    --hl-indigo: rgba(88, 96, 169, 0.35);
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

export const Card = styled.div`
  background: var(--surface);
  border-radius: 8px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: var(--primary-color);
          color: white;
          &:hover:not(:disabled) {
            background: var(--primary-hover);
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          &:hover:not(:disabled) {
            background: var(--background);
          }
        `;
      case 'danger':
        return `
          background: var(--error-color);
          color: white;
          &:hover:not(:disabled) {
            background: #B52B27;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
`;
