import React from 'react';
import { ClipboardCheck, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-6 text-center animate-fade-in">
      <div className="mb-6 p-6 rounded-3xl bg-surface-100 dark:bg-surface-800">
        <ClipboardCheck size={48} className="text-surface-400 dark:text-surface-500" />
      </div>
      <h2 className="text-xl font-medium text-surface-900 dark:text-surface-50 mb-3">{title}</h2>
      <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-filled flex items-center gap-2"
        >
          <Plus size={18} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;