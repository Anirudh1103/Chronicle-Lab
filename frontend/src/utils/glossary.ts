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
  
  // Wrap in a div to parse as a single DOM node
  const doc = new DOMParser().parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  if (!container) return htmlContent;
  
  // Sort terms by length descending so longer terms are matched first (e.g. "Shivaji Maharaj" before "Shivaji")
  const sortedItems = [...glossaryList].sort((a, b) => b.term.length - a.term.length);
  
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || '';
      
      let earliestMatch: {
        index: number;
        length: number;
        glossaryItem: GlossaryItem;
        matchedText: string;
      } | null = null;
      
      sortedItems.forEach((item) => {
        const escaped = item.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b(${escaped}s?)\\b`, 'i');
        const match = regex.exec(text);
        
        if (match && match.index !== undefined) {
          if (earliestMatch === null || match.index < earliestMatch.index) {
            earliestMatch = {
              index: match.index,
              length: match[0].length,
              glossaryItem: item,
              matchedText: match[0]
            };
          }
        }
      });
      
      if (earliestMatch) {
        const activeMatch = earliestMatch as { index: number; length: number; glossaryItem: GlossaryItem; matchedText: string; };
        const { index, length, glossaryItem, matchedText } = activeMatch;
        const beforeText = text.substring(0, index);
        const afterText = text.substring(index + length);
        
        const parent = node.parentNode;
        if (parent) {
          // Insert text before
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node);
          }
          
          // Insert glossary span
          const span = document.createElement('span');
          span.className = "glossary-term border-b border-dashed border-primary cursor-help hover:text-primary transition-colors duration-200";
          span.setAttribute('data-term', glossaryItem.term.toLowerCase());
          span.textContent = matchedText;
          parent.insertBefore(span, node);
          
          // Insert text after
          const afterNode = document.createTextNode(afterText);
          parent.insertBefore(afterNode, node);
          
          // Remove original node
          parent.removeChild(node);
          
          // Continue walk on the rest of the text
          walk(afterNode);
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Skip processing nested interactive components or links
      if (el.classList.contains('glossary-term') || el.tagName.toLowerCase() === 'a') {
        return;
      }
      
      // Copy children to avoid dynamic array modifications issues
      const children = Array.from(node.childNodes);
      children.forEach(walk);
    }
  };
  
  walk(container);
  return container.innerHTML;
}
