import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NewListFormProps {
  onCancel: () => void;
}

const NewListForm: React.FC<NewListFormProps> = ({ onCancel }) => {
  const { createList } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F97316', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#6B7280', // Gray
  ];
  
  useEffect(() => {
    // Focus the name input when the form mounts
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
    
    // Handle clicks outside the form to close it
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onCancel();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    await createList({
      name: name.trim(),
      color
    });
    
    onCancel();
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-3 p-2 bg-white rounded-lg border border-neutral-300 shadow-sm"
    >
      <div className="mb-3">
        <input
          ref={nameInputRef}
          type="text"
          placeholder="List name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
        />
      </div>
      
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(colorOption => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`w-6 h-6 rounded-full border-2 ${color === colorOption ? 'border-neutral-800' : 'border-transparent'}`}
              style={{ backgroundColor: colorOption }}
              aria-label={`Select color ${colorOption}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
        >
          <X size={16} />
        </button>
        
        <button
          type="submit"
          disabled={!name.trim()}
          className={`px-3 py-1 rounded text-sm ${
            name.trim() 
              ? 'bg-primary-600 text-white hover:bg-primary-700' 
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default NewListForm;