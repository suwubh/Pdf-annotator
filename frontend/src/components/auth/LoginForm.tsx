import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import { Button, Card } from '../../styles/GlobalStyle';

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6B8E23 0%, #C9B37E 100%);
  padding: 1rem;
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    margin: 0.5rem;
  }
`;

const AuthTitle = styled.h1`
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 700;
`;

const AuthSubtitle = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.875rem;
  font-size: 0.875rem;
`;

const AuthLink = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  
  a {
    color: var(--primary-color);
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--error-color);
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        login(response.token, response.user);
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Welcome back</AuthTitle>
        <AuthSubtitle>Sign in to your PDF Annotator account</AuthSubtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </SubmitButton>
        </form>

        <AuthLink>
          Don't have an account?{' '}
          <Link to="/register">Create one here</Link>
        </AuthLink>
      </AuthCard>
    </AuthContainer>
  );
};

export default LoginForm;
