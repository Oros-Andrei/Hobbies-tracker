import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  children: ReactNode;
}

// Share one touch-friendly control style across forms, cards and navigation.
export default function Button({ variant = 'secondary', className = '', children, ...props }: Props) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>;
}
