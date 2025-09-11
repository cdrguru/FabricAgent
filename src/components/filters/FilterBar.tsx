import React, { useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, Layers, Box, User, Eraser, Download } from 'lucide-react';
import { FilterChip } from './FilterChip';

export type SourceKey = 'all' | 'giac' | 'custom';

export interface FilterState {
  q: string;
  source: SourceKey;
  pillars: string[];
  pillarsMode?: 'any' | 'all';
}

interface FilterBarProps {
  allPillars: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
  counts?: { total: number; giac: number; custom: number };
  groupedPillars?: Record<string, string[]>;
  downloadUrl?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ allPillars, value, onChange, counts, groupedPillars, downloadUrl }) => {
  const debouncedQ = useDebounce(value.q, 250); // Updated to 250ms (within 150-300ms range)
  const [collapsed, setCollapsed] = React.useState(false);
  const touchStartY = React.useRef<number | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (debouncedQ !== value.q) onChange({ ...value, q: debouncedQ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  // Keyboard shortcut: Ctrl/Cmd + F toggles filter visibility and focuses search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setCollapsed(c => {
          const newCollapsed = !c;
          if (!newCollapsed && searchInputRef.current) {
            // Focus search input when expanding filters
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
          return newCollapsed;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const selectedSet = useMemo(() => new Set(value.pillars), [value.pillars]);
  const activeCount = (value.q ? 1 : 0) + (value.source !== 'all' ? 1 : 0) + value.pillars.length;

  const setSource = (s: SourceKey) => onChange({ ...value, source: s });
  const togglePillar = (p: string) => {
    const next = new Set(value.pillars);
    if (next.has(p)) next.delete(p); else next.add(p);
    onChange({ ...value, pillars: Array.from(next) });
  };
  const clearAll = () => onChange({ q: '', source: 'all', pillars: [] });

  const renderPillarButton = (p: string) => (
    <button
      key={p}
      type="button"
      role="checkbox"
      aria-checked={selectedSet.has(p)}
      onClick={() => togglePillar(p)}
      className={`px-3 py-1 text-sm rounded-full transition capitalize focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${selectedSet.has(p) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
    >
      {p.replace(/-/g, ' ')}
    </button>
  );

  const sourceBtn = (key: SourceKey, label: string, iconEl: React.ReactNode, count?: number) => {
    const isActive = value.source === key;
    const isDisabled = typeof count === 'number' && count === 0;
    return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={() => setSource(key)}
      className={`px-3 py-1 text-sm rounded-md transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isActive ? 'bg-white shadow-sm text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {iconEl}
      {label}{typeof count === 'number' ? ` (${count})` : ''}
    </button>
  ); };

  return (
    <div
      className="sticky top-16 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-slate-200 rounded-lg p-3 mb-4 will-transform"
      onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
      onTouchEnd={(e) => {
        if (touchStartY.current == null) return;
        const dy = (e.changedTouches[0].clientY - touchStartY.current);
        if (dy > 60 && !collapsed) setCollapsed(true);
        if (dy < -60 && collapsed) setCollapsed(false);
        touchStartY.current = null;
      }}
    >
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" aria-hidden="true" />
            <label htmlFor="filter-search" className="sr-only">Search prompts</label>
            <input
              ref={searchInputRef}
              id="filter-search" role="searchbox" aria-label="Search prompts"
              type="search"
              placeholder="Search…"
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 transition"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Search prompts by name, description, or content. Results update automatically as you type.
            </div>
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg" role="tablist" aria-label="Source filter">
              {sourceBtn('all', 'All', <Layers className="h-4 w-4" aria-hidden="true" />, counts?.total)}
              {sourceBtn('giac', 'Guy in a Cube', <Box className="h-4 w-4" aria-hidden="true" />, counts?.giac)}
              {sourceBtn('custom', 'Custom', <User className="h-4 w-4" aria-hidden="true" />, counts?.custom)}
            </div>
          )}
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full" aria-live="polite">Active: {activeCount}</span>
            {downloadUrl && (
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-100 inline-flex items-center gap-2">
                <Download className="h-4 w-4" aria-hidden="true" /> Download JSON
              </a>
            )}
            <button type="button" onClick={clearAll} className="text-sm text-slate-700 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-100 inline-flex items-center gap-2">
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              className="text-sm text-slate-700 hover:text-slate-900 px-3 py-1 rounded-md hover:bg-slate-100"
              aria-expanded={!collapsed}
              aria-controls="filterbar-contents"
              aria-label={`${collapsed ? 'Expand' : 'Collapse'} filter options`}
              title="Toggle filters (Ctrl/Cmd+F)"
            >
              {collapsed ? 'Expand Filters' : 'Collapse Filters'}
            </button>
          </div>
        </div>
      </div>
      {/* Active filter chips and AND/OR indicator */}
      <div className={`mt-2 ${collapsed ? 'hidden' : 'block'}`} aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Pillars match</span>
          <div className="inline-flex bg-slate-100 rounded-md p-0.5" role="tablist" aria-label="Pillar logic">
            {(['any','all'] as const).map(mode => (
              <button key={mode} role="tab" aria-selected={(value.pillarsMode||'any')===mode} onClick={() => onChange({ ...value, pillarsMode: mode })} className={`px-2 py-0.5 text-xs rounded ${((value.pillarsMode||'any')===mode) ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-700 hover:bg-slate-200'}`}>
                {mode === 'any' ? 'Any (OR)' : 'All (AND)'}
              </button>
            ))}
          </div>
          {value.q && (
            <FilterChip label={`q: ${value.q}`} onRemove={() => onChange({ ...value, q: '' })} />
          )}
          {value.source !== 'all' && (
            <FilterChip label={`source: ${value.source}`} onRemove={() => onChange({ ...value, source: 'all' })} />
          )}
          {value.pillars.map(p => (
            <FilterChip key={p} label={`pillar: ${p}`} onRemove={() => togglePillar(p)} />
          ))}
          {(!value.q && value.source === 'all' && value.pillars.length === 0) && (
            <span className="text-xs text-slate-400">No active filters</span>
          )}
        </div>
      </div>
      <div id="filterbar-contents" className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out`} style={{ maxHeight: collapsed ? 0 : '25vh' }} aria-label="Filter by pillars" role="group" aria-hidden={collapsed}>
        {groupedPillars ? (
          <div className="flex flex-wrap gap-1">
            {Object.entries(groupedPillars).map(([group, list]) => (
              <div key={group} className="min-w-full">
                <span className="text-xs uppercase tracking-wide text-slate-500 mr-2 mt-2 inline-block">{group}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {list.map(renderPillarButton)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-1 overflow-x-auto whitespace-nowrap py-1">
            {allPillars.map(renderPillarButton)}
          </div>
        )}
      </div>
    </div>
  );
};
