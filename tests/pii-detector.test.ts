import { describe, it, expect } from 'vitest';
import { detectAndRedactPii } from '../src/lib/pii-detector';

describe('PII Detection Engine', () => {
  it('detects and redacts emails and phone numbers', () => {
    const text = 'Contact Dr. Jane Smith at john.doe@example.com or call 08012345678 for details.';
    const result = detectAndRedactPii(text);

    expect(result.piiFound).toBe(true);
    expect(result.redactedText).toContain('[EMAIL]');
    expect(result.redactedText).toContain('[PHONE]');
    expect(result.redactedText).not.toContain('john.doe@example.com');
  });

  it('preserves health programme terms without false redaction', () => {
    const text = 'Maternal Health Outreach Programme evaluation in North District.';
    const result = detectAndRedactPii(text);

    expect(result.redactedText).toContain('Maternal Health Outreach Programme');
  });
});
