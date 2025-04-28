import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';

interface DatePickerProps {
  selectedDate: Date | null;
  onSelect: (date: Date | null) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }
    
    return rows;
  };
  
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const handleSelectToday = () => {
    onSelect(new Date());
    onClose();
  };
  
  const handleSelectTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onSelect(tomorrow);
    onClose();
  };
  
  const handleSelectNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    onSelect(nextWeek);
    onClose();
  };
  
  const handleClearDate = () => {
    onSelect(null);
    onClose();
  };
  
  const handleSelectDay = (day: Date) => {
    onSelect(day);
    onClose();
  };
  
  return (
    <div 
      ref={datePickerRef}
      className="absolute z-30 mt-1 left-0 right-0 md:right-auto bg-white rounded-md shadow-lg border border-neutral-200 w-full max-w-xs md:w-64"
    >
      <div className="p-2">
        <div className="mb-2 space-y-1">
          <button
            type="button"
            onClick={handleSelectToday}
            className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 rounded"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleSelectTomorrow}
            className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 rounded"
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={handleSelectNextWeek}
            className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 rounded"
          >
            Next week
          </button>
          {selectedDate && (
            <button
              type="button"
              onClick={handleClearDate}
              className="w-full px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100 rounded"
            >
              No date
            </button>
          )}
        </div>
        
        <div className="border-t border-neutral-200 pt-2">
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={prevMonth} 
              className="p-2 hover:bg-neutral-100 rounded-full"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={nextMonth} 
              className="p-2 hover:bg-neutral-100 rounded-full"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 py-1">
                {day}
              </div>
            ))}
            
            {getDaysInMonth().map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`text-center text-sm py-2 rounded-full ${
                        !isCurrentMonth 
                          ? 'text-neutral-300' 
                          : isSelected
                            ? 'bg-primary-600 text-white'
                            : isCurrentDay
                              ? 'bg-primary-100 text-primary-700'
                              : 'hover:bg-neutral-100'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="mt-2 border-t border-neutral-200 pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;