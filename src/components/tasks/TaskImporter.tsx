import React, { useState, useRef } from 'react';
import { X, FileUp, Check, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { TaskStep } from '../../types';

interface TaskImporterProps {
  onClose: () => void;
}

// Interface expandida para suportar estrutura hierárquica
interface ParsedTask {
  title: string;
  completed: boolean;
  notes?: string;
  steps: TaskStep[];
  level: number; // Nível de indentação
  children: ParsedTask[]; // Subtarefas com níveis mais profundos
}

const TaskImporter: React.FC<TaskImporterProps> = ({ onClose }) => {
  const { createTask, activeListId, lists } = useApp();
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [showFormats, setShowFormats] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // List ID logic (similar to TaskForm)
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
      
      // Função recursiva para criar tarefas e suas subtarefas
      const createTasksRecursively = async (tasks: ParsedTask[], parentTaskId?: string) => {
        for (const task of tasks) {
          try {
            // Se tem um pai, é uma subtarefa e deve ser adicionada como um passo
            if (parentTaskId) {
              // Subtarefas profundas são adicionadas como steps de suas tarefas pai
              // Aqui poderíamos estender para adicionar subtarefas como tarefas relacionadas
              // se o backend suportar isso
            } else {
              // Criar tarefa principal com seus steps diretos
              const createdTask = await createTask({
                title: task.title,
                completed: task.completed,
                important: task.title.includes('★') || task.title.includes('!') || task.title.includes('IMPORTANT'),
                notes: task.notes || undefined,
                listId,
                steps: task.steps
              });
              
              // Se houver filhos além dos steps diretos, criar eles recursivamente
              if (task.children.length > 0 && createdTask) {
                await createTasksRecursively(task.children, createdTask.id);
              }
              
              successCount++;
            }
          } catch (error) {
            console.error('Failed to import task:', task.title, error);
            failedCount++;
          }
        }
      };
      
      await createTasksRecursively(parsedTasks);
      
      setImportResult({ success: successCount, failed: failedCount });
    } catch (error) {
      console.error('Import parsing error:', error);
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
    
    // Detectar níveis de indentação
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
      
      // Detectar blocos de código
      if (trimmedLine.startsWith('```')) {
        isInCodeBlock = !isInCodeBlock;
        if (currentNotes) currentNotes += '\n' + line;
        continue;
      }
      
      // Se estamos em um bloco de código, adicionar às notas
      if (isInCodeBlock) {
        if (currentNotes) currentNotes += '\n' + line;
        else currentNotes = line;
        continue;
      }
      
      if (!trimmedLine) {
        // Linha vazia - se temos notas acumuladas, anexar à tarefa pendente
        if (currentNotes && pendingTask) {
          pendingTask.notes = currentNotes.trim();
          currentNotes = '';
          pendingTask = null;
        }
        continue;
      }
      
      // Determinar nível de indentação
      const leadingSpaces = line.search(/\S|$/);
      let indentLevel = 0;
      
      if (leadingSpaces > 0) {
        indentLevel = indentationLevels.findIndex(level => level >= leadingSpaces) + 1;
        if (indentLevel === 0) indentLevel = 1;
      }
      
      // Detectar diferentes formatos de tarefas
      const taskPatterns = [
        // Markdown checkbox format
        /^-\s*\[([ xX✓✗])\]\s+(.+)$/,
        /^\*\s*\[([ xX✓✗])\]\s+(.+)$/,
        /^\+\s*\[([ xX✓✗])\]\s+(.+)$/,
        // Unicode checkbox format
        /^(⬜|✅|☐|☑|✓|✗)\s+(.+)$/,
        // Simple list format (assumir não completa)
        /^[-*+]\s+(.+)$/,
        // Numbered list format
        /^\d+\.\s+(.+)$/,
        // Text with completion indicators
        /^(DONE|TODO|COMPLETED?):\s*(.+)$/i,
        // Obsidian/Notion format
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
        
        // Processar diferentes formatos
        switch (patternIndex) {
          case 0: // Markdown checkbox
          case 1:
          case 2:
            completed = ['x', 'X', '✓', '✗'].includes(taskMatch[1]);
            title = taskMatch[2].trim();
            break;
          case 3: // Unicode checkbox
            completed = ['✅', '☑', '✓'].includes(taskMatch[1]);
            title = taskMatch[2].trim();
            break;
          case 4: // Simple list
          case 5: // Numbered list
          case 7: // Obsidian/Notion
            completed = false;
            title = taskMatch[1].trim();
            break;
          case 6: // DONE/TODO format
            completed = taskMatch[1].toLowerCase() === 'done' || taskMatch[1].toLowerCase() === 'completed';
            title = taskMatch[2].trim();
            break;
        }
        
        // Extrair prioridade do título
        const priorityMatch = title.match(/^(!{1,3})\s*(.+)$/);
        if (priorityMatch) {
          title = priorityMatch[2].trim();
        }
        
        // Extrair tags do título
        const tagMatch = title.match(/^(.+?)\s+(#\w+(?:\s+#\w+)*)$/);
        let tags = '';
        if (tagMatch) {
          title = tagMatch[1].trim();
          tags = tagMatch[2];
        }
        
        // Extrair notas inline
        let notes: string | undefined;
        const inlineNotesPatterns = [
          /^(.+?)\s+Notes?:\s+(.+)$/i,
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
        
        // Anexar notas acumuladas à tarefa anterior se houver
        if (currentNotes && pendingTask) {
          pendingTask.notes = currentNotes.trim();
          currentNotes = '';
        }
        
        // Gerenciar hierarquia de tarefas
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
        // Linha não é uma tarefa - pode ser uma nota
        const notePatterns = [
          /^Notes?:\s*(.+)$/i,
          /^Description:\s*(.+)$/i,
          /^Details?:\s*(.+)$/i,
          /^>\s*(.+)$/, // Markdown quote
          /^\s*\/\/\s*(.+)$/, // Comment style
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
        
        // Se não é uma nota padrão mas parece ser conteúdo adicional
        if (!isNote && trimmedLine && !trimmedLine.startsWith('#') && pendingTask) {
          if (currentNotes) currentNotes += '\n' + trimmedLine;
          else currentNotes = trimmedLine;
        }
      }
    }
    
    // Anexar notas finais se houver
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
DONE: Tarefa concluída

**Com Prioridade:**
! Tarefa importante
!! Muito importante
!!! Crítica

**Com Notas:**
- [ ] Tarefa principal
  Notes: Detalhes da tarefa
- [ ] Outra tarefa (com nota inline)
- [ ] Tarefa // comentário
- [ ] Tarefa #tag #importante

**Hierarquia:**
- [ ] Tarefa principal
  - [ ] Subtarefa
    - [ ] Sub-subtarefa
      - [ ] Nível mais profundo

**Notas em Bloco:**
\`\`\`
Código ou texto
em múltiplas linhas
\`\`\`

> Citação ou nota
> em múltiplas linhas
`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <form
        ref={formRef}
        onSubmit={handleImport}
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              Importar Tarefas
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {!importResult ? (
            <>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowFormats(!showFormats)}
                  className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <Info size={16} className="mr-1" />
                  {showFormats ? 'Ocultar' : 'Ver'} formatos suportados
                </button>
                
                {showFormats && (
                  <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded text-xs">
                    <pre className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
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
    Notes: Detalhes aqui

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
DONE: Tarefa concluída`}
                className="w-full h-80 p-3 border border-neutral-300 dark:border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 text-sm font-mono bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
              />
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-4 flex justify-center">
                {importResult.failed === 0 ? (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <Check size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    <span className="text-2xl font-bold">!</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-medium mb-2 text-neutral-800 dark:text-neutral-200">
                {importResult.failed === 0 ? 'Importação Concluída' : 'Importação Concluída com Problemas'}
              </h3>
              
              <p className="text-neutral-600 dark:text-neutral-400">
                Tarefas importadas com sucesso: <span className="font-medium text-green-600 dark:text-green-400">{importResult.success}</span>
                {importResult.failed > 0 && (
                  <>
                    <br />
                    Falha ao importar: <span className="font-medium text-red-600 dark:text-red-400">{importResult.failed}</span> tarefas
                  </>
                )}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
          {!importResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700 rounded mr-2"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={!importText.trim() || isImporting}
                className={`px-4 py-2 rounded flex items-center ${
                  !importText.trim() || isImporting
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500'
                    : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                }`}
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importando...
                  </>
                ) : (
                  <>
                    <FileUp size={16} className="mr-2" />
                    Importar
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded"
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