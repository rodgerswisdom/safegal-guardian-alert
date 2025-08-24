import { ReactNode } from 'react';
import { AuthProvider, useAuthData } from '@/hooks/useAuth';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export const AuthProviderWrapper = ({ children }: AuthProviderWrapperProps) => {
  const auth = useAuthData();
  
  return (
    <AuthProvider value={auth}>
      {children}
    </AuthProvider>
  );
};