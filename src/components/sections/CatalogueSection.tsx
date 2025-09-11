
import React from 'react';
import { Prompt } from '../../types';
import { SectionCard } from '../ui/SectionCard';
import { PromptTable } from '../tables/PromptTable';
import { Hero } from '../ui/Hero';
import { Typography } from '../ui/Typography';
import { FilterBar, FilterState } from '../filters/FilterBar';
import { FilterPresets } from '../filters/FilterPresets';
import { useMemo } from 'react';
import { useQueryState } from '../../hooks/useQueryState';
import { parseQuery, matchPrompt, extractHighlightTokens } from '../../utils/search';

interface CatalogueSectionProps {
    prompts: Prompt[];
    downloadUrl: string;
    selectedPrompts: Set<string>;
    setSelectedPrompts: React.Dispatch<React.SetStateAction<Set<string>>>;
    onShowDetails: (prompt: Prompt) => void;
    globalPromptMap: Map<string, Prompt>;
    catalogueCount: number;
    workforceCount: number;
    dagNodeCount: number;
}

export const CatalogueSection: React.FC<CatalogueSectionProps> = ({
    prompts,
    downloadUrl,
    selectedPrompts,
    setSelectedPrompts,
    onShowDetails,
    globalPromptMap,
    catalogueCount,
    workforceCount,
    dagNodeCount,
}) => {
    const giacCount = prompts.filter(p => p.provenance === 'giac').length;
    const customCount = prompts.filter(p => p.provenance !== 'giac').length;

    const [filters, setFilters] = useQueryState<FilterState>('catalogueFilters', { q: '', source: 'all', pillars: [] });
    const allPillars = useMemo(() => {
        const s = new Set<string>();
        prompts.forEach(p => (p.pillars || []).forEach(x => s.add(x)));
        return Array.from(s).sort();
    }, [prompts]);

    const filtered = useMemo(() => {
        const parsed = parseQuery(filters.q || '');
        return prompts.filter(p => {
            const matchSearch = filters.q.length === 0 || matchPrompt(p, parsed);
            const matchSrc = filters.source === 'all' || (filters.source === 'giac' ? p.provenance === 'giac' : p.provenance !== 'giac');
            const pp = p.pillars || [];
            const mode = filters.pillarsMode || 'any';
            const matchPillars = filters.pillars.length === 0 || (mode === 'any' ? pp.some(x => filters.pillars.includes(x)) : filters.pillars.every(x => pp.includes(x)));
            return matchSearch && matchSrc && matchPillars;
        });
    }, [prompts, filters]);

    const highlightTokens = useMemo(() => extractHighlightTokens(filters.q || ''), [filters.q]);

    // Grouped pillars as per spec
    const groupedPillars = useMemo(() => {
        const groups: Record<string, string[]> = {
            'Governance & Security': [],
            'Performance & Modeling': [],
            'Visualization & Docs': [],
            'Other': [],
        };
        const map: Record<string, keyof typeof groups> = {
            governance: 'Governance & Security', security: 'Governance & Security', compliance: 'Governance & Security', 'ai-safety': 'Governance & Security', rls: 'Governance & Security',
            performance: 'Performance & Modeling', dax: 'Performance & Modeling', modeling: 'Performance & Modeling', 'semantic-model': 'Performance & Modeling',
            visualization: 'Visualization & Docs', documentation: 'Visualization & Docs',
        };
        for (const p of allPillars) {
            const key = (p || 'other').toLowerCase();
            const g = map[key] || 'Other';
            groups[g].push(p);
        }
        // prune empties
        return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0));
    }, [allPillars]);

    return (
        <>
            <Hero
                catalogueCount={catalogueCount}
                workforceCount={workforceCount}
                dagNodeCount={dagNodeCount}
                giacCount={giacCount}
                customCount={customCount}
                compact
            />
            <SectionCard>
             <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex-grow">
                    <Typography as="h2" className="flex items-center gap-3">
                        <i className="fas fa-book text-indigo-500"></i>
                        Curated Prompt Catalogue
                    </Typography>
                    <Typography as="subtle" className="mt-2 max-w-2xl">
                        Browse general-purpose, curated Power BI and Fabric prompts. Search by keyword or filter by pillars. Click a prompt to view details.
                        <a href={downloadUrl} target="_blank" download rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold ml-2">
                           Download JSON
                        </a>
                    </Typography>
                </div>
                      <div className="hidden md:flex items-center justify-center p-2">
                          <img src="/assets/illustrations/prompt-engineering-concept.svg" alt="Prompt validation process illustration" className="h-32 w-auto" />
                </div>
            </div>
            <FilterBar
                allPillars={allPillars}
                value={filters}
                onChange={setFilters}
                counts={{ total: prompts.length, giac: giacCount, custom: customCount }}
                groupedPillars={groupedPillars}
                downloadUrl={downloadUrl}
            />
            <FilterPresets namespace="catalogue" value={filters} onChange={setFilters} />
            <div className="mb-2 text-sm text-slate-600" aria-live="polite">
              Showing {filtered.length} of {prompts.length} prompts
            </div>
            <PromptTable
                prompts={filtered}
                onShowDetails={onShowDetails}
                selectedPrompts={selectedPrompts}
                setSelectedPrompts={setSelectedPrompts}
                globalPromptMap={globalPromptMap}
                highlightTokens={highlightTokens}
            />
        </SectionCard>
        </>
    );
};
