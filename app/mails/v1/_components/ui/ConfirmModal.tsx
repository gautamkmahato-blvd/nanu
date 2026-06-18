// components/ui/confirm-modal.tsx
'use client';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmColor = '#a78bfa',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={(e) => {e.stopPropagation(); onCancel()}}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 90,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 91,
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: 14,
        padding: 24,
        width: 360,
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        animation: 'modalIn 150ms ease-out',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', color: '#fafafa' }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '0 0 20px', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={(e) => {e.stopPropagation(); onCancel()}}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #27272a',
              background: 'transparent',
              color: '#a1a1aa',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onConfirm(); }}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: confirmColor,
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`@keyframes modalIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }`}</style>
    </>
  );
}
