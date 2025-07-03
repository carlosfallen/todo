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
      <div className="mb-6 p-6 rounded-3xl surface-container">
        <ClipboardCheck size={48} className="text-on-surface-variant" />
      </div>
      <h2 className="text-headline-small text-on-surface mb-3">{title}</h2>
      <p className="text-body-large text-on-surface-variant mb-8 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-filled flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="text-label-large">{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;