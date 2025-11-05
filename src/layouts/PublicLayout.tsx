import React from 'react';
import { Navigation } from '../components/common/Navigation';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary-dark">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
};