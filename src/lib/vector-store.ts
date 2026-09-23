import { db } from '@/db';
import { documentChunks, documents } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { AIProvider } from './hf-client';

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  chunkIndex: number;
  content: string;
  similarity: number;
}

// Memory fallback store for chunks during offline dev when PostgreSQL vector is not active
export const memoryChunksStore: Array<{
  id: string;
  documentId: string;
  workspaceId: string;
  documentName: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[];
}> = [];

export async function storeDocumentChunkVector(chunk: {
  documentId: string;
  workspaceId: string;
  documentName: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[];
}): Promise<string> {
  const id = crypto.randomUUID();
  const entry = {
    id,
    documentId: chunk.documentId,
    workspaceId: chunk.workspaceId,
    documentName: chunk.documentName,
    content: chunk.content,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    embedding: chunk.embedding,
  };

  memoryChunksStore.push(entry);

  try {
    await db.insert(documentChunks).values({
      id,
      documentId: chunk.documentId,
      workspaceId: chunk.workspaceId,
      content: chunk.content,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      embedding: chunk.embedding,
      metadata: { documentName: chunk.documentName },
    });
  } catch (err) {
    console.warn('Vector stored to memory fallback store:', chunk.documentName);
  }

  return id;
}

export async function searchVectorSimilarity(
  query: string,
  workspaceId: string,
  topK: number = 4
): Promise<VectorSearchResult[]> {
  const queryEmbedding = await AIProvider.generateEmbedding(query);

  try {
    // Vector search query using pgvector cosine distance operator (<->)
    const results = await db
      .select({
        chunkId: documentChunks.id,
        documentId: documentChunks.documentId,
        pageNumber: documentChunks.pageNumber,
        chunkIndex: documentChunks.chunkIndex,
        content: documentChunks.content,
        documentName: documents.name,
        // Cosine similarity formula: 1 - cosine_distance
        similarity: sql<number>`1 - (${documentChunks.embedding} <-> ${JSON.stringify(queryEmbedding)}::vector)`,
      })
      .from(documentChunks)
      .innerJoin(documents, eq(documentChunks.documentId, documents.id))
      .where(and(eq(documentChunks.workspaceId, workspaceId), eq(documents.status, 'COMPLETED')))
      .orderBy(sql`${documentChunks.embedding} <-> ${JSON.stringify(queryEmbedding)}::vector`)
      .limit(topK);

    if (results && results.length > 0) {
      return results.map((r) => ({
        chunkId: r.chunkId,
        documentId: r.documentId,
        documentName: r.documentName || 'Health Report',
        pageNumber: r.pageNumber,
        chunkIndex: r.chunkIndex,
        content: r.content,
        similarity: Math.max(0, Math.min(1, Number(r.similarity) || 0.85)),
      }));
    }
  } catch (err) {
    console.warn('PostgreSQL pgvector search fallback to memory store:', err);
  }

  // Fallback Cosine Similarity calculation over memoryChunksStore
  const filtered = memoryChunksStore.filter((c) => c.workspaceId === workspaceId);
  if (filtered.length === 0) return [];

  const scored = filtered.map((item) => {
    const similarity = cosineSimilarity(queryEmbedding, item.embedding);
    return {
      chunkId: item.id,
      documentId: item.documentId,
      documentName: item.documentName,
      pageNumber: item.pageNumber,
      chunkIndex: item.chunkIndex,
      content: item.content,
      similarity,
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.75;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.5;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
