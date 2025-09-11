import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FilterBar, type FilterState } from '../components/filters/FilterBar';

describe('FilterBar', () => {
  const allPillars = ['governance', 'performance'];
  const counts = { total: 2, giac: 1, custom: 1 };

  it('renders and updates search', () => {
    let value: FilterState = { q: '', source: 'all', pillars: [] };
    const onChange = (v: FilterState) => { value = v; };
    render(<FilterBar allPillars={allPillars} value={value} onChange={onChange} counts={counts} />);
    const input = screen.getByLabelText('Search prompts');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(value.q).toBe('abc');
  });

  it('toggles source', () => {
    let value: FilterState = { q: '', source: 'all', pillars: [] };
    const onChange = (v: FilterState) => { value = v; };
    render(<FilterBar allPillars={allPillars} value={value} onChange={onChange} counts={counts} />);
    fireEvent.click(screen.getByRole('tab', { name: /guy in a cube/i }));
    expect(value.source).toBe('giac');
  });

  it('toggles pillar chips', () => {
    let value: FilterState = { q: '', source: 'all', pillars: [] };
    const onChange = (v: FilterState) => { value = v; };
    render(<FilterBar allPillars={allPillars} value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /governance/i }));
    expect(value.pillars).toContain('governance');
  });
});

