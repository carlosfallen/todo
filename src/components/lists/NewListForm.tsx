import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NewListFormProps {
  onCancel: () => void;
}

const NewListForm: React.FC<NewListFormProps> = ({ onCancel }) => {
  const { createList } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6d28d9');
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const colorOptions = [
    '#6d28d9', // Primary Purple
    '#dc2626', // Red
    '#ea580c', // Orange
    '#ca8a04', // Yellow
    '#16a34a', // Green
    '#0891b2', // Cyan
    '#2563eb', // Blue
    '#7c3aed', // Violet
    '#c2410c', // Orange Red
    '#059669', // Emerald
    '#0284c7', // Sky
    '#7c2d12', // Brown
  ];
  
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
    
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
      className="card p-4 animate-scale-in"
    >
      <div className="mb-4">
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Nome da lista"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="text-label-medium text-on-surface-variant mb-2 block">
          Cor da lista
        </label>
        <div className="grid grid-cols-6 gap-2">
          {colorOptions.map(colorOption => (
            <button
              key={colorOption}
              type="button"
              onClick={() => setColor(colorOption)}
              className={`w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                color === colorOption 
                  ? 'border-surface-900 dark:border-surface-100 ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-50 dark:ring-offset-surface-900' 
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-500'
              }`}
              style={{ backgroundColor: colorOption }}
              aria-label={`Selecionar cor ${colorOption}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="btn-icon"
        >
          <X size={16} />
        </button>
        
        <button
          type="submit"
          disabled={!name.trim()}
          className="btn-filled"
        >
          <span className="text-label-large">Criar</span>
        </button>
      </div>
    </form>
  );
};

export default NewListForm;