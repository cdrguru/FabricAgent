import React, { useEffect } from 'react';
import { Prompt } from '../../types';
import { PillarBadge } from '../ui/PillarBadge';
import { GROUP_COLORS } from '../../constants';
import { isFavorite, toggleFavorite, getRating, setRating, getComment, setComment } from '../../utils/storage';
import { trapFocus } from '../../utils/focusTrap';

interface PromptDetailsModalProps {
    prompt: Prompt | null;
    onClose: () => void;
    context?: 'catalogue' | 'workforce';
    relatedPool?: Prompt[];
    onShowPrompt?: (p: Prompt) => void;
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

export const PromptDetailsModal: React.FC<PromptDetailsModalProps> = ({ prompt, onClose, context = 'catalogue', relatedPool, onShowPrompt }) => {
    const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
    const lastActiveRef = React.useRef<HTMLElement | null>(null);
    const [fav, setFav] = React.useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        lastActiveRef.current = (document.activeElement as HTMLElement) || null;
        window.addEventListener('keydown', handleKeyDown);
        setTimeout(() => closeBtnRef.current?.focus(), 0);
        let release: (() => void) | undefined;
        if (containerRef.current) {
          release = trapFocus(containerRef.current);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            release?.();
            lastActiveRef.current?.focus?.();
        };
    }, [onClose]);

    useEffect(() => {
        if (!prompt) return;
        setFav(isFavorite(prompt.id));
        const handler = (e: any) => { if (prompt && e?.detail?.id === prompt.id) setFav(!!e.detail.value); };
        window.addEventListener('fa:favorites-changed', handler);
        return () => window.removeEventListener('fa:favorites-changed', handler);
    }, [prompt]);

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
                ref={containerRef}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 id="prompt-modal-title" className="text-lg font-bold text-slate-800">{prompt.name || prompt.id}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFav(toggleFavorite(prompt.id))}
                        className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-slate-100"
                        aria-label={fav ? 'Unfavorite' : 'Favorite'}
                        title={fav ? 'Unfavorite' : 'Favorite'}
                      >
                        <i className={`fas fa-star ${fav ? 'text-amber-400' : 'text-slate-400'}`} aria-hidden="true"></i>
                      </button>
                      <button
                        onClick={() => { const url = new URL(window.location.href); url.searchParams.set('id', prompt.id); navigator.clipboard.writeText(url.toString()); }}
                        className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-slate-100"
                        aria-label="Copy link"
                        title="Copy link"
                      >
                        <i className="fas fa-link text-slate-500" aria-hidden="true"></i>
                      </button>
                      <button ref={closeBtnRef} onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close modal">
                          <i className="fas fa-times fa-lg" aria-hidden="true"></i>
                      </button>
                    </div>
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

                    {/* Examples (few_shots) */}
                    {!!(prompt.few_shots && prompt.few_shots.length) && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-slate-700 font-semibold">Examples</summary>
                        <div className="mt-2 space-y-3">
                          {prompt.few_shots!.slice(0, 5).map((fs, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Input</div>
                              <pre className="text-sm whitespace-pre-wrap break-words">{fs.input}</pre>
                              <div className="text-xs uppercase tracking-wide text-slate-500 mt-2 mb-1">Output</div>
                              <pre className="text-sm whitespace-pre-wrap break-words">{fs.output}</pre>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Tips (derive from actions/expected_outputs if present) */}
                    {(Array.isArray(prompt.actions) && prompt.actions.length) || (Array.isArray(prompt.expected_outputs) && prompt.expected_outputs.length) ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-slate-700 font-semibold">Tips</summary>
                        <div className="mt-2 grid sm:grid-cols-2 gap-3">
                          {Array.isArray(prompt.actions) && prompt.actions.length > 0 && (
                            <div>
                              <div className="font-medium text-slate-700 mb-1">Suggested Actions</div>
                              <ul className="list-disc pl-5 text-sm text-slate-700">
                                {prompt.actions!.slice(0,6).map((a, i) => (<li key={i}>{a}</li>))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(prompt.expected_outputs) && prompt.expected_outputs.length > 0 && (
                            <div>
                              <div className="font-medium text-slate-700 mb-1">Expected Outputs</div>
                              <ul className="list-disc pl-5 text-sm text-slate-700">
                                {prompt.expected_outputs!.slice(0,6).map((a, i) => (<li key={i}>{a}</li>))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    ) : null}

                    {/* Related Prompts */}
                    {Array.isArray(relatedPool) && relatedPool.length > 1 && (
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-2">Related Prompts</h4>
                        <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                          {getRelated(relatedPool, prompt).slice(0, 5).map(rel => (
                            <li key={rel.id} className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => onShowPrompt?.(rel)}>
                              <div className="font-medium text-slate-800">{rel.name || rel.id}</div>
                              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                                {(rel.pillars || []).map(p => <PillarBadge key={p} pillar={p} />)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Feedback */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-slate-700 mb-2">Feedback</h4>
                      <RatingRow id={prompt.id} />
                      <CommentBox id={prompt.id} />
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

function getRelated(pool: Prompt[], current: Prompt): Prompt[] {
  const cTags = new Set((current.tags || []).map(x => x.toLowerCase()));
  const cPillars = new Set((current.pillars || []).map(x => x.toLowerCase()));
  const scored = pool
    .filter(p => p.id !== current.id)
    .map(p => {
      const t = new Set((p.tags || []).map(x => x.toLowerCase()));
      const pl = new Set((p.pillars || []).map(x => x.toLowerCase()));
      let interTags = 0; t.forEach(x => { if (cTags.has(x)) interTags++; });
      let interPillars = 0; pl.forEach(x => { if (cPillars.has(x)) interPillars++; });
      const score = interTags + interPillars * 2;
      return { p, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.p);
  return scored;
}

const RatingRow: React.FC<{ id: string }> = ({ id }) => {
  const [val, setVal] = React.useState<number>(() => getRating(id) || 0);
  const avg = val || 0;
  const set = (n: number) => { setVal(n); setRating(id, n); };
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => set(n)} className="p-1" aria-label={`Rate ${n} out of 5`} title={`Rate ${n}/5`}>
            <i className={`fas fa-star ${n <= val ? 'text-amber-400' : 'text-slate-300'}`}></i>
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-500">Your rating: {val || '—'} • Average (local): {avg || '—'}</span>
    </div>
  );
};

const CommentBox: React.FC<{ id: string }> = ({ id }) => {
  const [text, setText] = React.useState<string>(() => getComment(id) || '');
  return (
    <div className="mt-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={() => setComment(id, text)}
        placeholder="Leave a tip or comment (saved locally)"
        className="w-full border border-slate-300 rounded-md p-2 text-sm"
        rows={3}
      />
      <div className="text-xs text-slate-400 mt-1">Stored locally in your browser.</div>
    </div>
  );
};
