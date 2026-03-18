import { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Btn = styled.button<{ $loading: boolean }>`
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.sm};
  padding: 6px 12px;
  cursor: ${(p) => (p.$loading ? 'wait' : 'pointer')};
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  transition: background 0.15s;
  white-space: nowrap;
  opacity: ${(p) => (p.$loading ? 0.7 : 1)};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

interface ExportButtonProps {
  targetSelector: string;
  fileName?: string;
}

export function ExportButton({ targetSelector, fileName = 'calendar' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    const node = document.querySelector(targetSelector) as HTMLElement | null;
    if (!node) return;

    setLoading(true);
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [targetSelector, fileName]);

  return (
    <Btn
      onClick={handleExport}
      $loading={loading}
      disabled={loading}
      aria-label="Download calendar as image"
      title="Download as PNG"
    >
      {loading ? 'Exporting...' : 'Export'}
    </Btn>
  );
}
