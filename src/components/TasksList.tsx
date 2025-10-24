import { Task, FilterState } from '../types';
import { TaskItem } from './TaskItem';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface TasksListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
  filters: FilterState;
  searchQuery: string;
}

interface DraggableTaskProps {
  task: Task;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (task: Task) => void;
}

const DraggableTask = ({ task, index, moveTask, onUpdate, onDelete, onDuplicate }: DraggableTaskProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <TaskItem
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
};

export const TasksList = ({ tasks, onUpdate, onDelete, onReorder, filters, searchQuery }: TasksListProps) => {
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'completed' && task.completed) ||
      (filters.status === 'pending' && !task.completed);

    const matchesPriority = filters.priority === 'all' ||
      (filters.priority === 'important' && task.important) ||
      (filters.priority === 'normal' && !task.important);

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const dragTask = filteredTasks[dragIndex];
    const newTasks = [...filteredTasks];
    newTasks.splice(dragIndex, 1);
    newTasks.splice(hoverIndex, 0, dragTask);
    onReorder(newTasks);
  };

  const handleDuplicate = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: '',
      title: `${task.title} (copy)`,
      completed: false,
      steps: task.steps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderIndex: tasks.length,
    };
    onReorder([...tasks, newTask]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {filteredTasks.map((task, index) => (
          <DraggableTask
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>
    </DndProvider>
  );
};