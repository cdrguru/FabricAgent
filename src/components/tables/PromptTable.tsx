import React, { useState, useMemo, useCallback } from 'react';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { Prompt } from '../../types';
import { PillarBadge } from '../ui/PillarBadge';
import { GROUP_COLORS } from '../../constants';
import { PromptDetailsModal } from './PromptDetailsModal';

interface PromptTableProps {
    prompts: Prompt[];
    onShowDetails: (prompt: Prompt) => void;
    selectedPrompts: Set<string>;
    setSelectedPrompts: React.Dispatch<React.SetStateAction<Set<string>>>;
    globalPromptMap: Map<string, Prompt>;
    highlightTokens?: string[];
}

const TableRow: React.FC<{
    prompt: Prompt;
    onShowDetails: (prompt: Prompt) => void;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    highlightTokens?: string[];
}> = React.memo(({ prompt, onShowDetails, isSelected, onToggleSelect, highlightTokens = [] }) => {

    const [isSummaryExpanded, setSummaryExpanded] = useState(false);
    const summary = prompt.summary || prompt.description || '';
    const canExpandSummary = summary.length > 100;

    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

    const handleQuickCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        const textToCopy = prompt.prompt || prompt.system || '';
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 1500);
        }
    };

    const highlight = (text: string) => {
        if (!highlightTokens.length) return text;
        let result: (string | JSX.Element)[] = [text];
        for (const token of highlightTokens) {
            const next: (string | JSX.Element)[] = [];
            for (const chunk of result) {
                if (typeof chunk !== 'string') { next.push(chunk); continue; }
                const parts = chunk.split(new RegExp(`(${token})`, 'ig'));
                parts.forEach((p, i) => {
                    if (p.toLowerCase() === token.toLowerCase()) next.push(<mark key={i} className="bg-yellow-200 text-slate-900">{p}</mark>);
                    else next.push(p);
                });
            }
            result = next;
        }
        return <>{result}</>;
    };

    return (
        <tr
            className="border-b border-slate-200 hover:bg-slate-50 group transition-colors focus-within:bg-slate-50"
            onClick={() => onShowDetails(prompt)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onShowDetails(prompt); }}}
            style={{ cursor: 'pointer' }}
            aria-label={`Prompt: ${prompt.name || prompt.id}. Press Enter to view details.`}
            role="button"
        >
            <td className="p-3 align-top">
                <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3 mt-1"
                      checked={isSelected}
                      onChange={() => onToggleSelect(prompt.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${prompt.name || prompt.id}`}
                    />
                    <div>
                         <div className="font-semibold text-slate-800 flex items-center gap-2">
                            {prompt.provenance === 'giac' ? (
                                <span title="Source: Guy in a Cube" className="flex items-center">
                                    <i className="fas fa-cube text-sky-500 mr-1"></i>
                                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">GIAC</span>
                                </span>
                            ) : (
                                <span title="Source: Custom" className="flex items-center">
                                    <i className="fas fa-user text-slate-500 mr-1"></i>
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Custom</span>
                                </span>
                            )}
                            <span className="ml-2">{highlight(String(prompt.name || prompt.id))}</span>
                        </div>
                        <div className="text-xs text-slate-500 ml-6">
                            {prompt.category || 'N/A'}
                            {prompt.provenance === 'giac' && prompt.links?.youtube && (
                                <a
                                    href={prompt.links.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-sky-600 hover:text-sky-800"
                                    onClick={(e) => e.stopPropagation()}
                                    title="View on YouTube"
                                >
                                    <i className="fab fa-youtube"></i>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </td>
            <td className="p-3 align-top text-sm text-slate-600">
                <div className="flex flex-wrap gap-1">
                    {(prompt.pillars || []).map(p => <PillarBadge key={p} pillar={p} />)}
                </div>
            </td>
            <td className="p-3 align-top text-sm text-slate-600 max-w-sm">
                <p>
                    {isSummaryExpanded ? highlight(summary) : highlight(`${summary.slice(0, 100)}${canExpandSummary ? '...' : ''}`)}
                    {canExpandSummary && (
                        <button onClick={(e) => { e.stopPropagation(); setSummaryExpanded(!isSummaryExpanded); }} className="text-indigo-600 hover:underline text-xs ml-1">
                            {isSummaryExpanded ? 'less' : 'more'}
                        </button>
                    )}
                </p>
            </td>
            <td className="p-3 align-top">
                 <div className="flex items-center justify-end space-x-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button onClick={handleQuickCopy} title="Quick copy prompt" aria-label="Quick copy prompt" className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors">
                           {copyState === 'copied' ? (
                               <i className="fas fa-check text-green-500" aria-hidden="true"></i>
                           ) : (
                               <i className="fas fa-copy text-slate-500" aria-hidden="true"></i>
                           )}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onShowDetails(prompt); }} title="View details" aria-label="View details" className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors">
                           <i className="fas fa-info-circle text-slate-500" aria-hidden="true"></i>
                        </button>
                    </div>
                 </div>
            </td>
        </tr>
    );
});


export const PromptTable: React.FC<PromptTableProps> = ({ prompts, onShowDetails, selectedPrompts, setSelectedPrompts, globalPromptMap }) => {

    const handleToggleSelect = useCallback((id: string) => {
        setSelectedPrompts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, [setSelectedPrompts]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPrompts(new Set(prompts.map(p => p.id)));
        } else {
            setSelectedPrompts(new Set());
        }
    };

    const handleDownloadSelected = () => {
        const data = Array.from(selectedPrompts)
            .map(id => globalPromptMap.get(String(id).toLowerCase()))
            .filter(Boolean);

        if (data.length === 0) return;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected-prompts.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isAllSelected = selectedPrompts.size > 0 && prompts.length > 0 && prompts.every(p => selectedPrompts.has(p.id));
    const isIndeterminate = selectedPrompts.size > 0 && !isAllSelected;

    return (
        <div>
            {selectedPrompts.size > 0 && (
                 <div className="bg-slate-50 p-2 rounded-lg mb-4 flex items-center justify-between animate-fade-in-up">
                    <span className="text-sm font-medium text-slate-700">{selectedPrompts.size} selected</span>
                    <div>
                        <button onClick={handleDownloadSelected} className="text-sm text-indigo-600 font-semibold hover:underline px-3 py-1">
                            <i className="fas fa-download mr-1"></i> Download
                        </button>
                        <button onClick={() => setSelectedPrompts(new Set())} className="text-sm text-slate-600 font-semibold hover:underline px-3 py-1">
                            <i className="fas fa-times mr-1"></i> Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Count is shown by parent sections to avoid duplication */}

            <div className="overflow-x-auto">
                <table className="w-full text-left" role="table" aria-label="Prompts catalog">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="p-3 text-sm font-semibold text-slate-600 w-2/5">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                                    checked={isAllSelected}
                                    // FIX: The ref callback was returning a boolean, which is not a valid return type.
                                    // It has been wrapped in a block statement to ensure it returns `void`.
                                    ref={el => { if (el) { el.indeterminate = isIndeterminate; } }}
                                    onChange={handleSelectAll}
                                    aria-label="Select all prompts"
                                />
                                Name / ID
                            </th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Pillars</th>
                            <th className="p-3 text-sm font-semibold text-slate-600 w-2/5">Summary</th>
                            <th className="p-3 text-sm font-semibold text-slate-600 text-right">
                              <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {prompts.length === 0 && (
                          <SkeletonLoader variant="table-row" />
                        )}
                        {prompts.map(prompt => (
                            <TableRow
                                key={prompt.id}
                                prompt={prompt}
                                onShowDetails={onShowDetails}
                                isSelected={selectedPrompts.has(prompt.id)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </tbody>
                </table>
                 {prompts.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No prompts found.
                    </div>
                )}
            </div>
        </div>
    );
};
