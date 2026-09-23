import mammoth from 'mammoth';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface DocumentParseResult {
  text: string;
  pages: ExtractedPage[];
  pageCount: number;
  wordCount: number;
}

export interface DocumentChunkData {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  wordCount: number;
}

export async function parseDocumentBuffer(
  buffer: Buffer,
  fileType: string
): Promise<DocumentParseResult> {
  const type = fileType.toLowerCase();

  if (type === 'pdf') {
    try {
      // Dynamic import for pdf-parse module compatibility
      const pdfParseModule = await import('pdf-parse');
      const pdfParser = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule as any).default || pdfParseModule;
      const pdfData = await pdfParser(buffer);
      const fullText = pdfData.text || '';
      
      const rawPages = fullText.split(/\f|\n\s*\n\s*\n/);
      const pages: ExtractedPage[] = rawPages.map((pageText: string, idx: number) => ({
        pageNumber: idx + 1,
        text: pageText.trim(),
      })).filter((p: ExtractedPage) => p.text.length > 0);

      const words = fullText.trim().split(/\s+/).filter(Boolean);
      return {
        text: fullText,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
        pageCount: pdfData.numpages || pages.length || 1,
        wordCount: words.length,
      };
    } catch (err) {
      console.warn('PDF parsing fallback to buffer string:', err);
      const text = buffer.toString('utf-8');
      const words = text.trim().split(/\s+/).filter(Boolean);
      return {
        text,
        pages: [{ pageNumber: 1, text }],
        pageCount: 1,
        wordCount: words.length,
      };
    }
  }

  if (type === 'docx' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const docxResult = await mammoth.extractRawText({ buffer });
      const fullText = docxResult.value || '';
      const paragraphs = fullText.split(/\n\s*\n/);
      
      const pages: ExtractedPage[] = [];
      let currentPageText = '';
      let currentPageNum = 1;
      let wordCount = 0;

      for (const p of paragraphs) {
        currentPageText += p + '\n\n';
        wordCount += p.split(/\s+/).length;
        if (wordCount >= 350) {
          pages.push({ pageNumber: currentPageNum++, text: currentPageText.trim() });
          currentPageText = '';
          wordCount = 0;
        }
      }
      if (currentPageText.trim()) {
        pages.push({ pageNumber: currentPageNum, text: currentPageText.trim() });
      }

      const totalWords = fullText.trim().split(/\s+/).filter(Boolean).length;
      return {
        text: fullText,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: fullText }],
        pageCount: pages.length || 1,
        wordCount: totalWords,
      };
    } catch (err) {
      console.warn('DOCX parse fallback:', err);
      const text = buffer.toString('utf-8');
      return {
        text,
        pages: [{ pageNumber: 1, text }],
        pageCount: 1,
        wordCount: text.split(/\s+/).length,
      };
    }
  }

  // Plain Text file
  const text = buffer.toString('utf-8');
  const words = text.trim().split(/\s+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/);
  const pages: ExtractedPage[] = [];
  let currentText = '';
  let pageNum = 1;
  let count = 0;

  for (const p of paragraphs) {
    currentText += p + '\n\n';
    count += p.split(/\s+/).length;
    if (count >= 300) {
      pages.push({ pageNumber: pageNum++, text: currentText.trim() });
      currentText = '';
      count = 0;
    }
  }
  if (currentText.trim()) {
    pages.push({ pageNumber: pageNum, text: currentText.trim() });
  }

  return {
    text,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text }],
    pageCount: pages.length || 1,
    wordCount: words.length,
  };
}

export function chunkDocumentPages(pages: ExtractedPage[]): DocumentChunkData[] {
  const chunks: DocumentChunkData[] = [];
  let chunkIndex = 0;
  const CHUNK_SIZE = 1800;
  const CHUNK_OVERLAP = 200;

  for (const page of pages) {
    const pageText = page.text;
    if (!pageText || pageText.trim().length === 0) continue;

    if (pageText.length <= CHUNK_SIZE) {
      chunks.push({
        content: pageText.trim(),
        pageNumber: page.pageNumber,
        chunkIndex: chunkIndex++,
        wordCount: pageText.trim().split(/\s+/).length,
      });
      continue;
    }

    let start = 0;
    while (start < pageText.length) {
      let end = start + CHUNK_SIZE;
      if (end < pageText.length) {
        const nextBreak = pageText.indexOf('\n', end - 100);
        if (nextBreak !== -1 && nextBreak < end + 100) {
          end = nextBreak;
        } else {
          const spaceBreak = pageText.lastIndexOf(' ', end);
          if (spaceBreak > start) end = spaceBreak;
        }
      }

      const chunkContent = pageText.substring(start, end).trim();
      if (chunkContent.length > 20) {
        chunks.push({
          content: chunkContent,
          pageNumber: page.pageNumber,
          chunkIndex: chunkIndex++,
          wordCount: chunkContent.split(/\s+/).length,
        });
      }

      start = end - CHUNK_OVERLAP;
      if (start >= pageText.length - CHUNK_OVERLAP) break;
    }
  }

  return chunks;
}
