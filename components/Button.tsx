import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-chiikawa-pink text-white hover:bg-red-300 border-2 border-transparent",
    secondary: "bg-white text-chiikawa-text border-2 border-chiikawa-blue hover:bg-blue-50",
    danger: "bg-white text-red-500 border-2 border-red-200 hover:bg-red-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};