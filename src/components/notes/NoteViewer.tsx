import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '../../types';

interface NoteViewerProps {
  note: Note;
}
 
const NoteViewer: React.FC<NoteViewerProps> = ({ note }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className='pts-4 dark:bg-surface-800'>
      <div className="max-w-4xl mx-auto p-6 rounded-3xl dark:bg-surface-900">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-display-small text-on-surface mb-6 border-b divider pb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-headline-medium text-on-surface mt-8 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-headline-small text-on-surface mt-6 mb-3">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-title-large text-on-surface mt-4 mb-2">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-title-medium text-on-surface mt-4 mb-2">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-title-small text-on-surface mt-4 mb-2">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="text-body-large text-on-surface mb-4 leading-relaxed">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-on-surface">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-on-surface">
                  {children}
                </em>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="bg-surface-200 dark:bg-surface-700 text-on-surface px-2 py-1 rounded text-body-medium font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="block bg-surface-200 dark:bg-surface-700 text-on-surface p-4 rounded-xl text-body-medium font-mono overflow-x-auto">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-surface-200 dark:bg-surface-700 text-on-surface p-4 rounded-xl overflow-x-auto mb-4">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 text-body-large text-on-surface">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 text-body-large text-on-surface">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-body-large text-on-surface">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-600 pl-4 py-2 mb-4 bg-surface-100 dark:bg-surface-800 rounded-r-xl">
                  <div className="text-body-large text-on-surface-variant italic">
                    {children}
                  </div>
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-surface-300 dark:border-surface-600 rounded-xl">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-surface-200 dark:bg-surface-700">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 text-left text-body-medium font-semibold text-on-surface border-b border-surface-300 dark:border-surface-600">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-body-medium text-on-surface border-b border-surface-300 dark:border-surface-600">
                  {children}
                </td>
              ),
              hr: () => (
                <hr className="my-8 border-surface-300 dark:border-surface-600" />
              ),
              input: ({ type, checked, disabled }) => {
                if (type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      className="mr-2 h-4 w-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
                      readOnly
                    />
                  );
                }
                return null;
              }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>

        {note.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t divider">
            <h4 className="text-title-medium text-on-surface mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-label-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t divider text-body-small text-on-surface-variant">
          <p>
            Criado em {new Date(note.createdAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {note.updatedAt !== note.createdAt && (
            <p>
              Atualizado em {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default NoteViewer;