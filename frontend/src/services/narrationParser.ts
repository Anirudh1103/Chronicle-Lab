export interface NarrationChunk {
  id: string; // Format: `${blockId}-${index}`
  blockId: string; // Back-reference to the block for highlighting
  text: string; // The speakable sentence/chunk text
  lang: string; // SpeechSynthesis language ('en-US', 'hi-IN', etc.)
  type: string; // The source block type
}

function cleanHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ') // Line breaks to spaces
    .replace(/<\/p>/gi, ' ') // Paragraph boundaries
    .replace(/<[^>]+>/g, '') // Strip tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/\s+/g, ' ') // Collapse whitespaces
    .trim();
}

/**
 * Split text into individual clean sentences.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  // Matches sentences ending with punctuation followed by space or end of string
  const sentences = text.match(/[^.!?]+[.!?]?(?=\s|$)/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Parses post blocks into structured narration chunks.
 */
export function parseNarration(title: string, subtitle: string | null, blocks: any[]): NarrationChunk[] {
  const chunks: NarrationChunk[] = [];

  // 1. Add Title & Subtitle
  const cleanTitle = cleanHtml(title);
  if (cleanTitle) {
    chunks.push({
      id: 'title-heading',
      blockId: 'title-heading',
      text: `${cleanTitle}.`,
      lang: 'en-US',
      type: 'title'
    });
  }

  const cleanSubtitle = cleanHtml(subtitle);
  if (cleanSubtitle) {
    chunks.push({
      id: 'title-subheading',
      blockId: 'title-subheading',
      text: `${cleanSubtitle}.`,
      lang: 'en-US',
      type: 'subtitle'
    });
  }

  // Helper to detect Devanagari characters (Hindi, Sanskrit, Marathi)
  const isDevanagari = (str: string) => /[\u0900-\u097F]/.test(str);

  // 2. Loop through blocks
  blocks.forEach((block) => {
    const { id: blockId, type, content } = block;

    switch (type) {
      case 'heading':
      case 'subheading': {
        const text = cleanHtml(content.text);
        if (text) {
          chunks.push({
            id: `${blockId}-0`,
            blockId,
            text: `${text}.`,
            lang: isDevanagari(text) ? 'hi-IN' : 'en-US',
            type
          });
        }
        break;
      }

      case 'paragraph': {
        const text = cleanHtml(content.text);
        const sentences = splitIntoSentences(text);
        sentences.forEach((sentence, idx) => {
          chunks.push({
            id: `${blockId}-${idx}`,
            blockId,
            text: sentence,
            lang: isDevanagari(sentence) ? 'hi-IN' : 'en-US',
            type
          });
        });
        break;
      }

      case 'quote': {
        const text = cleanHtml(content.text);
        const author = cleanHtml(content.author || content.source);
        const sentences = splitIntoSentences(text);
        
        sentences.forEach((sentence, idx) => {
          chunks.push({
            id: `${blockId}-${idx}`,
            blockId,
            text: sentence,
            lang: isDevanagari(sentence) ? 'hi-IN' : 'en-US',
            type
          });
        });

        if (author) {
          chunks.push({
            id: `${blockId}-author`,
            blockId,
            text: `Attributed to ${author}.`,
            lang: 'en-US',
            type: 'quote-author'
          });
        }
        break;
      }

      case 'translationquote':
      case 'translationQuote': {
        const text = cleanHtml(content.text);
        const translation = cleanHtml(content.translation);
        const meaning = cleanHtml(content.meaning);
        const author = cleanHtml(content.author || content.source);

        // Original quote (often Devanagari)
        if (text) {
          chunks.push({
            id: `${blockId}-orig`,
            blockId,
            text: `${text}.`,
            lang: isDevanagari(text) ? 'hi-IN' : 'en-US',
            type: 'quote-original'
          });
        }

        // English translation
        if (translation) {
          chunks.push({
            id: `${blockId}-trans`,
            blockId,
            text: `Translation: ${translation}.`,
            lang: 'en-US',
            type: 'quote-translation'
          });
        }

        // English meaning
        if (meaning) {
          chunks.push({
            id: `${blockId}-meaning`,
            blockId,
            text: `Meaning: ${meaning}.`,
            lang: 'en-US',
            type: 'quote-meaning'
          });
        }

        // Attribution
        if (author) {
          chunks.push({
            id: `${blockId}-author`,
            blockId,
            text: `Attributed to ${author}.`,
            lang: 'en-US',
            type: 'quote-author'
          });
        }
        break;
      }

      case 'list': {
        const items = content.items || [];
        items.forEach((item: string, idx: number) => {
          const text = cleanHtml(item);
          if (text) {
            chunks.push({
              id: `${blockId}-${idx}`,
              blockId,
              text: `Item ${idx + 1}. ${text}`,
              lang: isDevanagari(text) ? 'hi-IN' : 'en-US',
              type: 'list-item'
            });
          }
        });
        break;
      }

      case 'callout': {
        const text = cleanHtml(content.text);
        if (text) {
          chunks.push({
            id: `${blockId}-0`,
            blockId,
            text: `Note: ${text}`,
            lang: isDevanagari(text) ? 'hi-IN' : 'en-US',
            type
          });
        }
        break;
      }

      case 'table': {
        chunks.push({
          id: `${blockId}-0`,
          blockId,
          text: `This article contains a detailed table here. Please refer to the text page for the complete data.`,
          lang: 'en-US',
          type: 'table-summary'
        });
        break;
      }

      // Ignore files, images, code blocks, personalInsights (can be enabled if requested, but generally sidebar content), dividers
      default:
        break;
    }
  });

  return chunks;
}
