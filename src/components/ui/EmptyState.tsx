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
    <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-neutral-100">
        <ClipboardCheck size={32} className="text-neutral-400" />
      </div>
      <h2 className="text-lg font-medium text-neutral-800 mb-2">{title}</h2>
      <p className="text-neutral-500 mb-6 max-w-md text-sm md:text-base">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 px-4 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;