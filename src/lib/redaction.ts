/**
 * Privacy-first text redaction utilities for Safegal
 * Removes names, phone numbers, and other PII from free text
 */

// Common Kenyan names patterns (not exhaustive, but covers common cases)
const NAME_PATTERNS = [
  // Common first names
  /\b(Mary|John|Jane|Peter|Grace|James|Sarah|David|Faith|Michael|Elizabeth|Joseph|Anne|Daniel|Rose|Paul|Lucy|Samuel|Margaret|Francis|Catherine|George|Alice)\b/gi,
  
  // Common surnames
  /\b(Kamau|Wanjiku|Mwangi|Njoroge|Ochieng|Otieno|Kipchoge|Cheruiyot|Wafula|Maina|Karanja|Githui|Mutua|Musyoka|Kiprotich|Jepkorir)\b/gi,
  
  // General name patterns (capitalized words that could be names)
  /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g,
];

// Phone number patterns (Kenyan formats)
const PHONE_PATTERNS = [
  // +254 format
  /\+254\s*[17]\d{2}\s*\d{3}\s*\d{3}/g,
  // 07xx or 01xx format
  /\b0[17]\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g,
  // General phone patterns
  /\b\d{10,13}\b/g,
];

// Email patterns
const EMAIL_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
];

// ID number patterns
const ID_PATTERNS = [
  // Kenyan ID format
  /\b\d{7,8}\b/g,
];

// Address patterns
const ADDRESS_PATTERNS = [
  // P.O. Box patterns
  /P\.?\s*O\.?\s*Box\s*\d+/gi,
  // Common address indicators
  /\b\d+\s+(Street|Road|Avenue|Lane|Drive|Close|Way)\b/gi,
];

export const redactText = (text: string): string => {
  if (!text) return text;
  
  let redacted = text;
  
  // Replace names with [NAME]
  NAME_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[NAME]');
  });
  
  // Replace phone numbers with [PHONE]
  PHONE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[PHONE]');
  });
  
  // Replace emails with [EMAIL]
  EMAIL_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[EMAIL]');
  });
  
  // Replace ID numbers with [ID]
  ID_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[ID]');
  });
  
  // Replace addresses with [ADDRESS]
  ADDRESS_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, '[ADDRESS]');
  });
  
  // Clean up multiple consecutive redactions
  redacted = redacted.replace(/(\[NAME\]\s*){2,}/g, '[NAME] ');
  redacted = redacted.replace(/(\[PHONE\]\s*){2,}/g, '[PHONE] ');
  
  return redacted.trim();
};

export const hasRedactions = (original: string, redacted: string): boolean => {
  return original !== redacted && (
    redacted.includes('[NAME]') ||
    redacted.includes('[PHONE]') ||
    redacted.includes('[EMAIL]') ||
    redacted.includes('[ID]') ||
    redacted.includes('[ADDRESS]')
  );
};

export const getRedactionSummary = (original: string, redacted: string): string[] => {
  const redactions: string[] = [];
  
  if (redacted.includes('[NAME]')) {
    redactions.push('Names removed');
  }
  if (redacted.includes('[PHONE]')) {
    redactions.push('Phone numbers removed');
  }
  if (redacted.includes('[EMAIL]')) {
    redactions.push('Email addresses removed');
  }
  if (redacted.includes('[ID]')) {
    redactions.push('ID numbers removed');
  }
  if (redacted.includes('[ADDRESS]')) {
    redactions.push('Addresses removed');
  }
  
  return redactions;
};