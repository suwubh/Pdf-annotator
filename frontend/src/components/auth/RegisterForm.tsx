import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password
      );
      
      if (response.success) {
        login(response.token, response.user);
        toast.success('Account created successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthTitle>Create account</AuthTitle>
        <AuthSubtitle>Start annotating your PDFs today</AuthSubtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormGroup>

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
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </SubmitButton>
        </form>

        <AuthLink>
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </AuthLink>
      </AuthCard>
    </AuthContainer>
  );
};

export default RegisterForm;
