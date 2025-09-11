
export const GROUP_COLORS: { [key: string]: string } = {
  'power-query': '#ffd966',
  'modeling-tmdl': '#6fa8dc',
  'dax': '#93c47d',
  'performance-bpa': '#e06666',
  'deployment-governance': '#a64d79',
  'documentation': '#8e7cc3',
  'prompt-engineering': '#76a5af',
  'ai-safety': '#ff9900',
  // Extended pillars
  'fabric': '#5dade2',
  'architecture': '#45b39d',
  'lakehouse': '#85c1e9',
  'warehouse': '#5499c7',
  'semantic-model': '#bb8fce',
  'spark': '#f39c12',
  'rls': '#f1948a',
  'incremental-refresh': '#58d68d',
  'directquery': '#48c9b0',
  'direct-lake': '#76d7c4',
  'ci-cd': '#7fb3d5',
  'devops': '#73c6b6',
  'gitops': '#85c1e9',
  'monitoring': '#f5b041',
  'optimization': '#f0b27a',
  'compliance': '#d98880',
  'capacity': '#7dcea0',
  'other': '#aaaaaa'
};

// Prefer VITE_HELP_CENTER_URL; fallback to VITE_HELP_URL; then public README.
// verify: import.meta.env.VITE_HELP_CENTER_URL
export const HELP_URL =
  (import.meta.env.VITE_HELP_CENTER_URL as string | undefined) ||
  (import.meta.env.VITE_HELP_URL as string | undefined) ||
  'https://github.com/cdrguru/FabricAgent#readme';

// Map common aliases/synonyms to canonical pillar keys used above
export const PILLAR_ALIASES: Record<string, string> = {
  // Preferred canonical: documentation
  'docs': 'documentation',
  'user-guide': 'documentation',
  'user-guides': 'documentation',
  'dashboard': 'documentation',
  'report': 'documentation',
  'reporting': 'documentation',
  'visual': 'documentation',
  'summary': 'documentation',
  'support': 'documentation',
  'data-dictionary': 'documentation',
  'json-schema': 'documentation',
  'citations': 'documentation',
  'personas': 'documentation',
  'proposal': 'documentation',
  'vendor-neutral': 'documentation',
  'ui-analysis': 'documentation',
  'user-experience': 'documentation',
  'training': 'documentation',
  'troubleshooting': 'documentation',
  'feature-prioritization': 'documentation',
  'contact-center': 'documentation',

  // Governance
  'governance': 'deployment-governance',
  'ai-governance': 'ai-safety',
  'safety': 'ai-safety',
  'compliance': 'compliance',
  'csdr': 'compliance',

  // Performance
  'performance': 'performance-bpa',
  'bpa': 'performance-bpa',
  'optimization': 'optimization',
  'vertipaq': 'performance-bpa',

  // Modeling
  'tmdl': 'modeling-tmdl',
  'tabular': 'modeling-tmdl',
  'kpi': 'modeling-tmdl',
  'composite-model': 'modeling-tmdl',
  'dataset': 'modeling-tmdl',
  'import-mode': 'modeling-tmdl',
  'field-parameters': 'modeling-tmdl',
  'semantic-guide': 'semantic-model',

  // Power Query
  'm-language': 'power-query',
  'm-query': 'power-query',
  'query-folding': 'power-query',
  'parameterization': 'power-query',

  // Security
  'rls': 'rls',
  'ols': 'rls',

  // Connectivity
  'directquery': 'directquery',
  'direct-lake': 'direct-lake',
  'incremental-refresh': 'incremental-refresh',
  'refresh': 'incremental-refresh',

  // Dev lifecycle
  'ci': 'ci-cd',
  'cicd': 'ci-cd',
  'ci-cd': 'ci-cd',
  'devops': 'devops',
  'gitops': 'gitops',
  'testing': 'ci-cd',
  'user-testing': 'ci-cd',
  'validation': 'ci-cd',
  'pbip': 'ci-cd',

  // Architecture
  'architecture': 'architecture',
  'semantic-model': 'semantic-model',
  'lakehouse': 'lakehouse',
  'warehouse': 'warehouse',
  'fabric': 'fabric',
  'powerbi': 'fabric',
  'gateway': 'fabric',
  'data-factory': 'fabric',
  'integration': 'architecture',
  'modernization': 'architecture',

  // Capacity/Monitoring
  'capacity-planning': 'capacity',
  'utilization': 'capacity',
  'monitoring': 'monitoring',

  // DAX/Measures/Calc
  'measure': 'dax',
  'aggregation': 'dax',
  'calculation-groups': 'dax',

  // AI & Prompting
  'ai': 'prompt-engineering',
  'azure-openai': 'prompt-engineering',
  'azureopenai': 'prompt-engineering',
  'engineering': 'prompt-engineering',
  'sequence': 'prompt-engineering',
  'agent-execution': 'prompt-engineering',
  'analysis': 'optimization',
  'automation': 'ci-cd',
  'export': 'documentation',
  'finops': 'capacity',
  'research': 'documentation',
  'deep-research': 'documentation',
  'workforce': 'documentation',
  'enhancement': 'optimization',
  'refactor': 'optimization',
  'refactoring': 'optimization'
};
