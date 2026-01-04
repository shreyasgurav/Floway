/**
 * Utility functions
 */

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Check for exact word match (not just substring)
  const words = normalizedText.split(/\s+/);
  return words.some(word => word === normalizedKeyword);
}

