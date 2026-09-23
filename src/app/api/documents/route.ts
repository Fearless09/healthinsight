import { NextResponse } from 'next/server';
import { db } from '@/db';
import { documents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { DEMO_HEALTH_REPORTS } from '@/db/seed';

export async function GET() {
  const session = await getSession();
  const workspaceId = session?.workspaceId || 'wsp-global-001';

  try {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId))
      .orderBy(desc(documents.createdAt));

    if (docs.length > 0) {
      return NextResponse.json({ documents: docs });
    }
  } catch (err) {
    console.warn('DB query documents fallback:', err);
  }

  // Fallback demo documents
  const demoDocs = DEMO_HEALTH_REPORTS.map((r, idx) => ({
    id: `doc-demo-00${idx + 1}`,
    workspaceId,
    uploadedBy: 'usr-admin-001',
    name: r.name,
    fileType: r.fileType,
    fileSize: Buffer.byteLength(r.content),
    storagePath: `/demo/${r.name}`,
    status: 'COMPLETED',
    pageCount: 1,
    wordCount: r.content.split(/\s+/).length,
    summary: 'Evaluation report reviewing maternal ANC completion rates, referral statistics, and critical community transportation barriers.',
    extractedFindings: [
      'Antenatal care completion reached 84.2% across participating rural health clinics.',
      'Emergency transport delays averaged 85 minutes in unpaved road areas.',
      'Community transport voucher pilots reduced delay to care by 34%.',
    ],
    hasPiiDetected: true,
    piiSummary: { count: 3, types: ['PERSON', 'PHONE'] },
    createdAt: new Date(Date.now() - idx * 3600000 * 24),
    processedAt: new Date(),
  }));

  return NextResponse.json({ documents: demoDocs });
}
