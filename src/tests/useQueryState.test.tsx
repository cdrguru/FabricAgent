import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useQueryState } from '../hooks/useQueryState';

describe('useQueryState', () => {
  beforeEach(() => {
    history.replaceState({}, '', '/');
  });

  it('initializes with default and syncs URL', () => {
    const { result } = renderHook(() => useQueryState('k', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });
    act(() => result.current[1]({ a: 2 }));
    expect(new URLSearchParams(location.search).get('k')).toBe(JSON.stringify({ a: 2 }));
  });

  it('parses existing URL state', () => {
    history.replaceState({}, '', '/?k=%7B%22a%22%3A3%7D');
    const { result } = renderHook(() => useQueryState('k', { a: 1 }));
    expect(result.current[0]).toEqual({ a: 3 });
  });
});

