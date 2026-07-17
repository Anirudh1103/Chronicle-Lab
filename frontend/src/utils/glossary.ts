export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  category: string;
}

/**
 * Searches HTML text for glossary terms (ignoring occurrences inside HTML tags)
 * and wraps them in an interactive span.
 */
export function highlightGlossary(
  htmlContent: string | null | undefined,
  glossaryList: GlossaryItem[]
): string {
  if (!htmlContent) return '';
  if (!glossaryList || glossaryList.length === 0) return htmlContent;
  
  const tagOrText = /(<[^>]+>|[^<]+)/g;
  
  return htmlContent.replace(tagOrText, (part) => {
    if (part.startsWith('<')) {
      return part; // Skip HTML tags
    }
    
    let text = part;
    
    // Sort terms by length descending so longer terms are matched first (e.g. "Double Opt-in" before "API")
    const sortedItems = [...glossaryList].sort((a, b) => b.term.length - a.term.length);
    
    sortedItems.forEach((item) => {
      const escaped = item.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Match the term as a whole word, supporting optional plural 's', case-insensitively
      const regex = new RegExp(`\\b(${escaped}s?)\\b`, 'gi');
      
      text = text.replace(
        regex, 
        `<span class="glossary-term border-b border-dashed border-primary cursor-help hover:text-primary transition-colors duration-200" data-term="${item.term.toLowerCase()}">$1</span>`
      );
    });
    
    return text;
  });
}
