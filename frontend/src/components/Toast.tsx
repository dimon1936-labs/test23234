import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const ToastWrapper = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ToastItem = styled.div<{ $variant: 'error' | 'success' }>`
  background: ${(p) => (p.$variant === 'error' ? theme.colors.danger : theme.colors.success)};
  color: ${theme.colors.surface};
  padding: 10px 16px;
  border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.base};
  box-shadow: ${theme.shadows.md};
  animation: ${slideIn} 0.3s ease-out;
  max-width: 360px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.surface};
  cursor: pointer;
  font-size: 16px;
  padding: 0 2px;
  opacity: 0.8;
  margin-left: auto;

  &:hover {
    opacity: 1;
  }
`;

interface ToastProps {
  message: string | null;
  variant?: 'error' | 'success';
  onClose: () => void;
  autoHideMs?: number;
}

export function Toast({ message, variant = 'error', onClose, autoHideMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(timer);
  }, [message, onClose, autoHideMs]);

  if (!message) return null;

  return (
    <ToastWrapper role="alert" aria-live="assertive">
      <ToastItem $variant={variant}>
        <span>{message}</span>
        <CloseBtn onClick={onClose} aria-label="Close notification">&times;</CloseBtn>
      </ToastItem>
    </ToastWrapper>
  );
}
