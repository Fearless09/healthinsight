import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { uploadFile } from '@/lib/storage';
import { parseDocumentBuffer, chunkDocumentPages } from '@/lib/doc-parser';
import { detectAndRedactPii } from '@/lib/pii-detector';
import { AIProvider } from '@/lib/hf-client';
import { storeDocumentChunkVector } from '@/lib/vector-store';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  const session = await getSession();
  const role = session?.role || 'PROGRAMME_MANAGER';

  if (!hasPermission(role, 'canUploadDocuments')) {
    return NextResponse.json({ error: 'Permission denied: Your role cannot upload documents' }, { status: 403 });
  }

  const workspaceId = session?.workspaceId || 'wsp-global-001';
  const userId = session?.userId || 'usr-pm-002';
  const userEmail = session?.email || 'pm@healthinsight.org';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

    if (!['pdf', 'docx', 'txt'].includes(fileExtension)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Storage Upload
    const storageResult = await uploadFile(fileName, fileBuffer, file.type || 'text/plain');

    // 2. Text Extraction
    const parseResult = await parseDocumentBuffer(fileBuffer, fileExtension);

    // 3. PII Detection & Scrubbing
    const piiResult = detectAndRedactPii(parseResult.text);

    // 4. Semantic Chunking
    const redactedPages = parseResult.pages.map((p) => ({
      pageNumber: p.pageNumber,
      text: detectAndRedactPii(p.text).redactedText,
    }));
    const chunks = chunkDocumentPages(redactedPages);

    // 5. AI Insight & Summary Generation
    const summary = await AIProvider.summarize(piiResult.redactedText);
    const extractedFindings = await AIProvider.extractInsights(piiResult.redactedText);

    const docId = crypto.randomUUID();
    const newDoc = {
      id: docId,
      workspaceId,
      uploadedBy: userId,
      name: fileName,
      fileType: fileExtension,
      fileSize: file.size,
      storagePath: storageResult.url,
      status: 'COMPLETED' as const,
      pageCount: parseResult.pageCount,
      wordCount: parseResult.wordCount,
      summary,
      extractedFindings,
      hasPiiDetected: piiResult.piiFound,
      piiSummary: { count: piiResult.totalCount, types: piiResult.detectedTypes },
      createdAt: new Date(),
      processedAt: new Date(),
    };

    try {
      await db.insert(documents).values(newDoc);
    } catch (err) {
      console.warn('DB document insert fallback:', err);
    }

    // 6. Vector Store Indexing
    for (const chunk of chunks) {
      const embedding = await AIProvider.generateEmbedding(chunk.content);
      await storeDocumentChunkVector({
        documentId: docId,
        workspaceId,
        documentName: fileName,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        embedding,
      });
    }

    // 7. Audit Log
    await logAuditEvent({
      workspaceId,
      userId,
      userEmail,
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: docId,
      metadata: { name: fileName, fileSize: file.size, piiFound: piiResult.piiFound },
    });

    return NextResponse.json({ success: true, document: newDoc, chunksCount: chunks.length });
  } catch (err: any) {
    console.error('Document upload error:', err);
    return NextResponse.json({ error: err.message || 'Document processing failed' }, { status: 500 });
  }
}
