export interface PiiDetectionResult {
  originalText: string;
  redactedText: string;
  piiFound: boolean;
  detectedTypes: string[];
  totalCount: number;
  matches: Array<{ type: string; value: string }>;
}

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const ID_NUMBER_REGEX = /\b(?:ID|NIN|SSN|PASSPORT|NHS)[-:\s]?[A-Z0-9]{6,12}\b/gi;
const SPECIFIC_ID_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g; // SSN style
const ADDRESS_REGEX = /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way|Court|Ct)\b/gi;

// Common title-cased names regex pattern (e.g. Dr. Jane Smith, John Doe, Patient Patient Name)
const NAME_PATTERNS = [
  /\b(?:Dr\.|Mr\.|Mrs\.|Ms\.|Patient|Subject)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g, // Full capitalized name pair
];

export function detectAndRedactPii(text: string): PiiDetectionResult {
  let redacted = text;
  const matches: Array<{ type: string; value: string }> = [];
  const typeSet = new Set<string>();

  // 1. Redact Emails
  redacted = redacted.replace(EMAIL_REGEX, (match) => {
    matches.push({ type: 'EMAIL', value: match });
    typeSet.add('EMAIL');
    return '[EMAIL]';
  });

  // 2. Redact Phone Numbers
  redacted = redacted.replace(PHONE_REGEX, (match) => {
    matches.push({ type: 'PHONE', value: match });
    typeSet.add('PHONE');
    return '[PHONE]';
  });

  // 3. Redact ID numbers / SSN
  redacted = redacted.replace(ID_NUMBER_REGEX, (match) => {
    matches.push({ type: 'ID_NUMBER', value: match });
    typeSet.add('ID_NUMBER');
    return '[ID]';
  });
  redacted = redacted.replace(SPECIFIC_ID_REGEX, (match) => {
    matches.push({ type: 'ID_NUMBER', value: match });
    typeSet.add('ID_NUMBER');
    return '[ID]';
  });

  // 4. Redact Street Addresses
  redacted = redacted.replace(ADDRESS_REGEX, (match) => {
    matches.push({ type: 'ADDRESS', value: match });
    typeSet.add('ADDRESS');
    return '[ADDRESS]';
  });

  // 5. Redact Person Names (selective regex)
  for (const pattern of NAME_PATTERNS) {
    redacted = redacted.replace(pattern, (match) => {
      // Exclude common medical/programme words that start with capital letters
      const lower = match.toLowerCase();
      if (
        lower.includes('maternal health') ||
        lower.includes('community health') ||
        lower.includes('adolescent health') ||
        lower.includes('district hospital') ||
        lower.includes('health center') ||
        lower.includes('outreach programme')
      ) {
        return match;
      }
      matches.push({ type: 'PERSON', value: match });
      typeSet.add('PERSON');
      return '[PERSON]';
    });
  }

  return {
    originalText: text,
    redactedText: redacted,
    piiFound: matches.length > 0,
    detectedTypes: Array.from(typeSet),
    totalCount: matches.length,
    matches,
  };
}
