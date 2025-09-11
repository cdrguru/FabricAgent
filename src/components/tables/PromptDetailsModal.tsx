import React, { useEffect } from 'react';
import { Prompt } from '../../types';
import { PillarBadge } from '../ui/PillarBadge';
import { GROUP_COLORS } from '../../constants';

interface PromptDetailsModalProps {
    prompt: Prompt | null;
    onClose: () => void;
    context?: 'catalogue' | 'workforce';
}

const PromptBlock: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        // Add visual feedback if desired
    };

    return (
        <div className="mt-4">
            <h5 className="font-semibold text-slate-700">{title}</h5>
            <div className="relative mt-1">
                <pre className="bg-slate-100 text-slate-800 rounded-lg p-4 text-sm whitespace-pre-wrap break-words overflow-x-auto">
                    {content}
                </pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 bg-white/50 hover:bg-white/80 p-1.5 rounded-md text-slate-500 hover:text-slate-800 transition"
                    title="Copy content"
                    aria-label="Copy content"
                >
                    <i className="fas fa-copy" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    );
};

export const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({ prompt, onClose, context = 'catalogue' }) => {
    const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
    const lastActiveRef = React.useRef<HTMLElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        lastActiveRef.current = (document.activeElement as HTMLElement) || null;
        window.addEventListener('keydown', handleKeyDown);
        setTimeout(() => closeBtnRef.current?.focus(), 0);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            lastActiveRef.current?.focus?.();
        };
    }, [onClose]);

    if (!prompt) return null;

    const getYouTubeId = (url: string | undefined): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youTubeId = getYouTubeId(prompt.links?.youtube);

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
            style={{ animationDuration: '0.2s' }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-modal-title"
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 id="prompt-modal-title" className="text-lg font-bold text-slate-800">{prompt.name || prompt.id}</h3>
                    <button ref={closeBtnRef} onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                        <i className="fas fa-times fa-lg" aria-hidden="true"></i>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Metadata Section */}
                    <div className="space-y-1">
                        <p><strong>ID:</strong> <code className="text-sm bg-slate-100 px-1 py-0.5 rounded">{prompt.id}</code></p>
                        {prompt.provenance && (
                            <p><strong>Source:</strong>
                                <span className={`capitalize ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    prompt.provenance === 'giac' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {prompt.provenance === 'giac' ? 'Guy in a Cube' : 'Custom'}
                                </span>
                            </p>
                        )}
                        {prompt.version && <p><strong>Version:</strong> {prompt.version}</p>}
                        {context === 'workforce' ? (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-slate-700">Metadata</summary>
                            {prompt.category && <p className="mt-1"><strong>Category:</strong> {prompt.category}</p>}
                            <div className="flex items-center gap-2 pt-1">
                              <strong>Pillars:</strong>
                              <div className="flex flex-wrap gap-2">
                                {(prompt.pillars || []).map(p => <PillarBadge key={p} pillar={p} />)}
                              </div>
                            </div>
                          </details>
                        ) : (
                          <>
                            {prompt.category && <p><strong>Category:</strong> {prompt.category}</p>}
                            <div className="flex items-center gap-2 pt-1">
                              <strong>Pillars:</strong>
                              <div className="flex flex-wrap gap-2">
                                {(prompt.pillars || []).map(p => <PillarBadge key={p} pillar={p} />)}
                              </div>
                            </div>
                          </>
                        )}
                    </div>

                    {/* Summary */}
                     {(prompt.summary || prompt.description) && (
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-1">Summary</h4>
                            <p className="text-slate-600">{prompt.summary || prompt.description}</p>
                        </div>
                    )}

                    {/* YouTube Video Embed */}
                    {prompt.provenance === 'giac' && youTubeId && (
                        <div>
                            <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                                <i className="fab fa-youtube text-red-500 mr-2"></i>
                                Guy in a Cube Source
                            </h4>
                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${youTubeId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Safety & Governance */}
                    {prompt.safety && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-800 flex items-center"><i className="fas fa-shield-alt mr-2"></i>Safety & Governance</h4>
                             {prompt.safety.safety_clause && <p className="mt-2 text-sm text-amber-700"><strong>Clause:</strong> {prompt.safety.safety_clause}</p>}
                        </div>
                    )}

                    {/* Prompt Content */}
                    <div>
                         <h4 className="font-semibold text-slate-700 mb-1 text-lg border-t pt-4">Prompt Content</h4>
                         {prompt.prompt && <PromptBlock title="Full Prompt" content={prompt.prompt} />}
                         {prompt.system && <PromptBlock title="System Message" content={prompt.system} />}
                         {prompt.user_template && <PromptBlock title="User Template" content={prompt.user_template} />}
                    </div>

                </div>
                 <div className="p-4 border-t border-slate-200 bg-slate-50 text-right rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
