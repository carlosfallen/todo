import { FilterState } from '../types';
import { Filter } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTags: string[];
}

export const Filters = ({ filters, onChange, availableTags }: FiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-3">
      <div className="flex items-center gap-2 font-semibold text-gray-700">
        <Filter size={18} />
        <span>Filters</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as FilterState['status'] })}
          className="w-full px-3 py-2 border rounded-lg outline-none"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as FilterState['priority'] })}
          className="w-full px-3 py-2 border rounded-lg outline-none"
        >
          <option value="all">All</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                const newTags = filters.tags.includes(tag)
                  ? filters.tags.filter(t => t !== tag)
                  : [...filters.tags, tag];
                onChange({ ...filters, tags: newTags });
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.tags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};