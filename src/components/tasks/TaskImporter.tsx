import React, { useState, useRef } from 'react';
import { X, FileUp, Check, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { TaskStep } from '../../types';

interface TaskImporterProps {
  onClose: () => void;
}

interface ParsedTask {
  title: string;
  completed: boolean;
  notes?: string;
  steps: TaskStep[];
  level: number;
  children: ParsedTask[];
}

const TaskImporter: React.FC<TaskImporterProps> = ({ onClose }) => {
  const { createTask, activeListId, lists } = useApp();
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [showFormats, setShowFormats] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const listId = activeListId === 'all' || activeListId === 'important' || activeListId === 'planned'
    ? lists[0]?.id || 'default'
    : activeListId;
  
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    
    setIsImporting(true);
    
    try {
      const parsedTasks = parseImportText(importText);
      let successCount = 0;
      let failedCount = 0;
      
      const createTasksRecursively = async (tasks: ParsedTask[], parentTaskId?: string) => {
        for (const task of tasks) {
          try {
            if (parentTaskId) {
              // Subtarefas são adicionadas como steps
            } else {
              const createdTask = await createTask({
                title: task.title,
                completed: task.completed,
                important: task.title.includes('★') || task.title.includes('!') || task.title.includes('IMPORTANTE'),
                notes: task.notes || undefined,
                listId,
                steps: task.steps
              });
              
              if (task.children.length > 0 && createdTask) {
                await createTasksRecursively(task.children, createdTask.id);
              }
              
              successCount++;
            }
          } catch (error) {
            console.error('Falha ao importar tarefa:', task.title, error);
            failedCount++;
          }
        }
      };
      
      await createTasksRecursively(parsedTasks);
      
      setImportResult({ success: successCount, failed: failedCount });
    } catch (error) {
      console.error('Erro de parsing na importação:', error);
      setImportResult({ success: 0, failed: 1 });
    } finally {
      setIsImporting(false);
    }
  };
  
  const parseImportText = (text: string) => {
    const lines = text.split('\n');
    const rootTasks: ParsedTask[] = [];
    const taskStack: ParsedTask[] = [];
    
    const now = new Date().toISOString();
    
    const indentationLevels: number[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const leadingSpaces = line.search(/\S|$/);
      if (leadingSpaces > 0 && !indentationLevels.includes(leadingSpaces)) {
        indentationLevels.push(leadingSpaces);
      }
    }
    
    indentationLevels.sort((a, b) => a - b);
    
    let currentNotes = '';
    let isInCodeBlock = false;
    let pendingTask: ParsedTask | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('```')) {
        isInCodeBlock = !isInCodeBlock;
        if (currentNotes) currentNotes += '\n' + line;
        continue;
      }
      
      if (isInCodeBlock) {
        if (currentNotes) currentNotes += '\n' + line;
        else currentNotes = line;
        continue;
      }
      
      if (!trimmedLine) {
        if (currentNotes && pendingTask) {
          pendingTask.notes = currentNotes.trim();
          currentNotes = '';
          pendingTask = null;
        }
        continue;
      }
      
      const leadingSpaces = line.search(/\S|$/);
      let indentLevel = 0;
      
      if (leadingSpaces > 0) {
        indentLevel = indentationLevels.findIndex(level => level >= leadingSpaces) + 1;
        if (indentLevel === 0) indentLevel = 1;
      }
      
      const taskPatterns = [
        /^-\s*\[([ xX✓✗])\]\s+(.+)$/,
        /^\*\s*\[([ xX✓✗])\]\s+(.+)$/,
        /^\+\s*\[([ xX✓✗])\]\s+(.+)$/,
        /^(⬜|✅|☐|☑|✓|✗)\s+(.+)$/,
        /^[-*+]\s+(.+)$/,
        /^\d+\.\s+(.+)$/,
        /^(FEITO|TODO|CONCLUÍDO?):\s*(.+)$/i,
        /^-\s+(.+)$/,
      ];
      
      let taskMatch: RegExpMatchArray | null = null;
      let patternIndex = -1;
      
      for (let j = 0; j < taskPatterns.length; j++) {
        taskMatch = trimmedLine.match(taskPatterns[j]);
        if (taskMatch) {
          patternIndex = j;
          break;
        }
      }
      
      if (taskMatch) {
        let completed = false;
        let title = '';
        
        switch (patternIndex) {
          case 0:
          case 1:
          case 2:
            completed = ['x', 'X', '✓', '✗'].includes(taskMatch[1]);
            title = taskMatch[2].trim();
            break;
          case 3:
            completed = ['✅', '☑', '✓'].includes(taskMatch[1]);
            title = taskMatch[2].trim();
            break;
          case 4:
          case 5:
          case 7:
            completed = false;
            title = taskMatch[1].trim();
            break;
          case 6:
            completed = taskMatch[1].toLowerCase() === 'feito' || taskMatch[1].toLowerCase() === 'concluído';
            title = taskMatch[2].trim();
            break;
        }
        
        const priorityMatch = title.match(/^(!{1,3})\s*(.+)$/);
        if (priorityMatch) {
          title = priorityMatch[2].trim();
        }
        
        const tagMatch = title.match(/^(.+?)\s+(#\w+(?:\s+#\w+)*)$/);
        let tags = '';
        if (tagMatch) {
          title = tagMatch[1].trim();
          tags = tagMatch[2];
        }
        
        let notes: string | undefined;
        const inlineNotesPatterns = [
          /^(.+?)\s+Notas?:\s+(.+)$/i,
          /^(.+?)\s+\((.+)\)$/,
          /^(.+?)\s+-\s+(.+)$/,
          /^(.+?)\s+\/\/\s*(.+)$/,
        ];
        
        for (const pattern of inlineNotesPatterns) {
          const notesMatch = title.match(pattern);
          if (notesMatch) {
            title = notesMatch[1].trim();
            notes = notesMatch[2].trim();
            if (tags) notes += ' ' + tags;
            break;
          }
        }
        
        if (!notes && tags) {
          notes = tags;
        }
        
        const newTask: ParsedTask = {
          title,
          completed,
          notes,
          steps: [],
          level: indentLevel,
          children: []
        };
        
        if (currentNotes && pendingTask) {
          pendingTask.notes = currentNotes.trim();
          currentNotes = '';
        }
        
        if (indentLevel === 0) {
          rootTasks.push(newTask);
          taskStack.length = 0;
          taskStack.push(newTask);
        } else {
          while (taskStack.length > 0 && taskStack[taskStack.length - 1].level >= indentLevel) {
            taskStack.pop();
          }
          
          if (taskStack.length === 0) {
            rootTasks.push(newTask);
          } else {
            const parentTask = taskStack[taskStack.length - 1];
            
            if (indentLevel === 1) {
              parentTask.steps.push({
                id: uuidv4(),
                taskId: '',
                title,
                completed,
                orderIndex: parentTask.steps.length,
                createdAt: now,
                updatedAt: now
              });
            } else {
              parentTask.children.push(newTask);
            }
          }
          
          taskStack.push(newTask);
        }
        
        pendingTask = newTask;
      } else {
        const notePatterns = [
          /^Notas?:\s*(.+)$/i,
          /^Descrição:\s*(.+)$/i,
          /^Detalhes?:\s*(.+)$/i,
          /^>\s*(.+)$/,
          /^\s*\/\/\s*(.+)$/,
        ];
        
        let isNote = false;
        for (const pattern of notePatterns) {
          const noteMatch = trimmedLine.match(pattern);
          if (noteMatch) {
            if (currentNotes) currentNotes += '\n' + noteMatch[1];
            else currentNotes = noteMatch[1];
            isNote = true;
            break;
          }
        }
        
        if (!isNote && trimmedLine && !trimmedLine.startsWith('#') && pendingTask) {
          if (currentNotes) currentNotes += '\n' + trimmedLine;
          else currentNotes = trimmedLine;
        }
      }
    }
    
    if (currentNotes && pendingTask) {
      pendingTask.notes = currentNotes.trim();
    }
    
    return rootTasks;
  };
  
  const formatExamples = `
📋 **Formatos Suportados:**

**Markdown:**
- [ ] Tarefa não concluída
- [x] Tarefa concluída
* [ ] Com asterisco
+ [X] Com mais

**Unicode:**
⬜ Tarefa pendente
✅ Tarefa concluída
☐ Alternativa 1
☑ Alternativa 2

**Listas Simples:**
- Tarefa simples
* Outra tarefa
+ Mais uma tarefa
1. Tarefa numerada

**Formato TODO:**
TODO: Fazer algo
FEITO: Tarefa concluída

**Com Prioridade:**
! Tarefa importante
!! Muito importante
!!! Crítica

**Com Notas:**
- [ ] Tarefa principal
  Notas: Detalhes da tarefa
- [ ] Outra tarefa (com nota inline)
- [ ] Tarefa // comentário
- [ ] Tarefa #tag #importante

**Hierarquia:**
- [ ] Tarefa principal
  - [ ] Subtarefa
    - [ ] Sub-subtarefa
      - [ ] Nível mais profundo
`;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <form
        ref={formRef}
        onSubmit={handleImport}
        className="card-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
      >
        <div className="p-6 border-b border-outline-variant/20">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-surface-900 dark:text-surface-50">
              Importar Tarefas
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors ripple"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!importResult ? (
            <>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowFormats(!showFormats)}
                  className="btn-text flex items-center gap-2 text-sm"
                >
                  <Info size={16} />
                  {showFormats ? 'Ocultar' : 'Ver'} formatos suportados
                </button>
                
                {showFormats && (
                  <div className="mt-3 p-4 bg-surface-100 dark:bg-surface-800 rounded-2xl text-xs animate-slide-down">
                    <pre className="whitespace-pre-wrap text-surface-700 dark:text-surface-300">
                      {formatExamples}
                    </pre>
                  </div>
                )}
              </div>
              
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Cole sua lista de tarefas em qualquer formato:

Markdown:
- [ ] Tarefa não concluída
- [x] Tarefa concluída
  - [ ] Subtarefa
    Notas: Detalhes aqui

Unicode:
⬜ Tarefa pendente
✅ Tarefa concluída

Listas simples:
- Tarefa simples
* Outra tarefa
1. Tarefa numerada

Com prioridade e tags:
! Tarefa importante #trabalho
!! Muito importante (com nota)

Formatos TODO:
TODO: Fazer algo
FEITO: Tarefa concluída`}
                className="input-field w-full h-80 font-mono text-sm resize-none"
              />
            </>
          ) : (
            <div className="py-8 text-center animate-fade-in">
              <div className="mb-6 flex justify-center">
                {importResult.failed === 0 ? (
                  <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-3xl flex items-center justify-center text-success-600 dark:text-success-400">
                    <Check size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <span className="text-2xl font-bold">!</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-medium mb-3 text-surface-900 dark:text-surface-50">
                {importResult.failed === 0 ? 'Importação Concluída' : 'Importação Concluída com Problemas'}
              </h3>
              
              <p className="text-surface-600 dark:text-surface-400">
                Tarefas importadas com sucesso: <span className="font-medium text-success-600 dark:text-success-400">{importResult.success}</span>
                {importResult.failed > 0 && (
                  <>
                    <br />
                    Falha ao importar: <span className="font-medium text-error-600 dark:text-error-400">{importResult.failed}</span> tarefas
                  </>
                )}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-surface-100 dark:bg-surface-800 border-t border-outline-variant/20 flex justify-end gap-3">
          {!importResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="btn-outlined"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={!importText.trim() || isImporting}
                className={`btn-filled flex items-center gap-2 ${
                  !importText.trim() || isImporting
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <FileUp size={16} />
                    Importar
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-filled"
            >
              Concluído
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskImporter;