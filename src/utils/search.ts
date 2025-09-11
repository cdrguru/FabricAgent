export type Field = 'name' | 'id' | 'summary' | 'description' | 'pillar';
export interface ParsedQuery {
  must: { field?: Field; value: string }[];
  should: { field?: Field; value: string }[];
  not: { field?: Field; value: string }[];
}

const fieldMap: Record<string, Field> = {
  name: 'name', id: 'id', summary: 'summary', description: 'description', pillar: 'pillar', pillars: 'pillar'
};

export function parseQuery(q: string): ParsedQuery {
  const tokens = q.match(/(?:\w+:)?\S+/g) || [];
  const pq: ParsedQuery = { must: [], should: [], not: [] };
  let mode: 'must' | 'should' = 'must';
  for (let raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    if (/^AND$/i.test(t)) { mode = 'must'; continue; }
    if (/^OR$/i.test(t)) { mode = 'should'; continue; }
    if (/^NOT$/i.test(t)) { mode = 'must'; continue; }
    let neg = false;
    if (t.startsWith('-')) { neg = true; raw = t.slice(1); }
    const [key, ...rest] = raw.split(':');
    let field: Field | undefined;
    let value: string;
    if (rest.length) { field = fieldMap[key.toLowerCase()]; value = rest.join(':'); }
    else { value = key; }
    const term = { field, value: value.toLowerCase() };
    if (neg) pq.not.push(term);
    else if (mode === 'must') pq.must.push(term);
    else pq.should.push(term);
  }
  return pq;
}

export function matchPrompt(p: any, parsed: ParsedQuery): boolean {
  const textFor = (f?: Field): string[] => {
    if (!f) return [p.name, p.id, p.summary, p.description].map(x => (x || '').toLowerCase());
    if (f === 'pillar') return (p.pillars || []).map((x: string) => (x || '').toLowerCase());
    return [String(p[f] || '').toLowerCase()];
  };
  const hasTerm = (term: { field?: Field; value: string }) => textFor(term.field).some(t => t.includes(term.value));
  if (parsed.must.some(t => !hasTerm(t))) return false;
  if (parsed.not.some(t => hasTerm(t))) return false;
  if (parsed.should.length > 0 && !parsed.should.some(t => hasTerm(t))) return false;
  return true;
}

export function extractHighlightTokens(q: string): string[] {
  return (q.match(/\b(?!AND|OR|NOT\b)\w{2,}\b/gi) || []).map(t => t.toLowerCase());
}

