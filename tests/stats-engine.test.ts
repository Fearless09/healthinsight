import { describe, it, expect } from 'vitest';
import { calculateDeterministicStats, parseAndValidateCSV } from '../src/lib/stats-engine';

describe('Deterministic TS Statistical Engine', () => {
  it('accurately computes totals, completion rate, and missing percentage without LLM math', () => {
    const csvContent = `location,participants,completed,referred,outcome_rate,date
Site A,100,80,10,80.0,2025-01-01
Site B,200,160,20,80.0,2025-02-01
Site C,300,240,30,80.0,2025-03-01`;

    const { rows, columns } = parseAndValidateCSV(csvContent);
    const stats = calculateDeterministicStats(rows, columns);

    expect(stats.totalParticipants).toBe(600);
    expect(stats.averageParticipants).toBe(200);
    expect(stats.completionRate).toBe(80.0);
    expect(stats.missingDataPercentage).toBe(0.0);
  });
});
