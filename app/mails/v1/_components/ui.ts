import type { CSSProperties } from 'react';

export const btnBase: CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  lineHeight: 1.4,
  cursor: 'pointer',
  background: '#fff',
  color: '#111827',
};

export const btnSecondary: CSSProperties = {
  ...btnBase,
  background: '#f9fafb',
};

export const btnPrimary: CSSProperties = {
  ...btnBase,
  background: '#111827',
  color: '#fff',
  borderColor: '#111827',
};

export const btnGhost: CSSProperties = {
  ...btnBase,
  background: 'transparent',
  borderColor: 'transparent',
};

export function btnDisabled(disabled: boolean): CSSProperties {
  return disabled ? { opacity: 0.55, cursor: 'not-allowed' } : {};
}
