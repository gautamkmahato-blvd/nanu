// components/email-actions/email-action-buttons.tsx
'use client';

import { useState } from 'react';
import { useToast } from '../ui/ToastProvider';
import ConfirmModal from '../ui/ConfirmModal';

type Props = {
  emailId: string;
  subject: string | null;
  initialDone?: boolean;
  initialImportant?: boolean;
  onActionComplete?: (action: string) => void;
};

export default function EmailActionButtons({
  emailId,
  subject,
  initialDone = false,
  initialImportant = false,
  onActionComplete,
}: Props) {
  const { showToast } = useToast();
  const [isDone, setIsDone] = useState(initialDone);
  const [isImportant, setIsImportant] = useState(initialImportant);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    action: string;
    title: string;
    message: string;
    confirmLabel: string;
    confirmColor: string;
  }>({
    isOpen: false,
    action: '',
    title: '',
    message: '',
    confirmLabel: '',
    confirmColor: '',
  });
  const [loading, setLoading] = useState(false);

  const emailSubject = subject || '(no subject)';

  function openModal(action: string) {
    switch (action) {
      case 'mark_done':
        setModalConfig({
          isOpen: true,
          action,
          title: 'Mark as Done',
          message: `Mark "${emailSubject}" as done? This will remove it from tasks & deadlines.`,
          confirmLabel: 'Mark Done',
          confirmColor: '#22c55e',
        });
        break;
      case 'unmark_done':
        setModalConfig({
          isOpen: true,
          action,
          title: 'Undo Done',
          message: `Move "${emailSubject}" back to active?`,
          confirmLabel: 'Undo',
          confirmColor: '#f59e0b',
        });
        break;
      case 'mark_important':
        setModalConfig({
          isOpen: true,
          action,
          title: 'Mark as Important',
          message: `Mark "${emailSubject}" as important?`,
          confirmLabel: 'Mark Important',
          confirmColor: '#f59e0b',
        });
        break;
      case 'unmark_important':
        setModalConfig({
          isOpen: true,
          action,
          title: 'Remove Important',
          message: `Remove important flag from "${emailSubject}"?`,
          confirmLabel: 'Remove',
          confirmColor: '#6b7280',
        });
        break;
    }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/emails/${emailId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: modalConfig.action }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Action failed');
      }

      switch (modalConfig.action) {
        case 'mark_done':
          setIsDone(true);
          showToast('Marked as done', 'success');
          break;
        case 'unmark_done':
          setIsDone(false);
          showToast('Moved back to active', 'info');
          break;
        case 'mark_important':
          setIsImportant(true);
          showToast('Marked as important', 'success');
          break;
        case 'unmark_important':
          setIsImportant(false);
          showToast('Removed important flag', 'info');
          break;
      }

      onActionComplete?.(modalConfig.action);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setLoading(false);
      setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  }

  return (
    <>
      {/* Action buttons — small, inline */}
      <div
        style={{ display: 'flex', gap: 4, flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Done button */}
        <button
          onClick={(e) => { e.stopPropagation(); openModal(isDone ? 'unmark_done' : 'mark_done'); }}
          title={isDone ? 'Undo done' : 'Mark as done'}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: isDone ? '#22c55e20' : 'transparent',
            color: isDone ? '#22c55e' : '#52525b',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.color = '#22c55e'; }}
          onMouseLeave={(e) => { if (!isDone) e.currentTarget.style.color = '#52525b'; }}
        >
          {isDone ? '✓' : '○'}
        </button>

        {/* Important button */}
        <button
          onClick={(e) => { e.stopPropagation(); openModal(isImportant ? 'unmark_important' : 'mark_important'); }}
          title={isImportant ? 'Remove important' : 'Mark as important'}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: isImportant ? '#f59e0b20' : 'transparent',
            color: isImportant ? '#f59e0b' : '#52525b',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { if (!isImportant) e.currentTarget.style.color = '#f59e0b'; }}
          onMouseLeave={(e) => { if (!isImportant) e.currentTarget.style.color = '#52525b'; }}
        >
          {isImportant ? '★' : '☆'}
        </button>
      </div>

      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        confirmColor={modalConfig.confirmColor}
        onConfirm={handleConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        loading={loading}
      />
    </>
  );
}
