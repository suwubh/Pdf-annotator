// src/components/common/Layout.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FileText, 
  Upload, 
  LogOut, 
  Menu,
  Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../styles/GlobalStyle';
import toast from 'react-hot-toast';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--background);
`;

const Sidebar = styled.aside<{ isOpen: boolean }>`
  width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
    box-shadow: var(--shadow-lg);
  }
`;

const SidebarOverlay = styled.div<{ isVisible: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
`;

const Logo = styled.h1`
  color: var(--primary-color);
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SidebarContent = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${({ $isActive }) => $isActive ? 'var(--primary-color)' : 'var(--text-secondary)'};
  background: ${({ $isActive }) => $isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent'};
  border-right: ${({ $isActive }) => $isActive ? '3px solid var(--primary-color)' : '3px solid transparent'};
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background: ${({ $isActive }) => $isActive ? 'rgba(37, 99, 235, 0.1)' : 'var(--background)'};
    color: var(--primary-color);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--background);
  border-radius: 6px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.header`
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (min-width: 769px) {
    .mobile-menu-button {
      display: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: var(--background);
    color: var(--text-primary);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload PDF' },
    { path: '/library', icon: FileText, label: 'My Library' },
  ];

  return (
    <LayoutContainer>
      <SidebarOverlay isVisible={sidebarOpen} onClick={closeSidebar} />
      
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            <FileText />
            PDF Annotator
          </Logo>
        </SidebarHeader>
        
        <SidebarContent>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              $isActive={location.pathname === item.path}
              onClick={closeSidebar}
            >
              <item.icon />
              {item.label}
            </NavItem>
          ))}
        </SidebarContent>
        
        <SidebarFooter>
          <UserProfile>
            <Avatar>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <UserInfo>
              <UserName>{user?.name}</UserName>
              <UserEmail>{user?.email}</UserEmail>
            </UserInfo>
          </UserProfile>
          
          <Button variant="secondary" onClick={handleLogout} style={{ width: '100%' }}>
            <LogOut style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      
      <MainContent>
        <TopBar>
          <MobileMenuButton 
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </MobileMenuButton>
          <PageTitle>{title || 'Dashboard'}</PageTitle>
        </TopBar>
        
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
