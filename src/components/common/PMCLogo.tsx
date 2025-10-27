import React from 'react';
import pmcLogo from '../../assets/images/pmc-logo.png';

interface PMCLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export const PMCLogo: React.FC<PMCLogoProps> = ({ 
  className = '', 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-8 w-auto',
    medium: 'h-12 w-auto',
    large: 'h-16 w-auto',
    xlarge: 'h-24 w-auto'
  };

  return (
    <img 
      src={pmcLogo} 
      alt="PMC Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};