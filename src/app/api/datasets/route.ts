import { NextResponse } from 'next/server';
import { db } from '@/db';
import { datasets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { DEMO_CSV_DATASETS } from '@/db/seed';
import { parseAndValidateCSV, calculateDeterministicStats } from '@/lib/stats-engine';

export async function GET() {
  const session = await getSession();
  const workspaceId = session?.workspaceId || 'wsp-global-001';

  try {
    const list = await db
      .select()
      .from(datasets)
      .where(eq(datasets.workspaceId, workspaceId))
      .orderBy(desc(datasets.createdAt));

    if (list.length > 0) {
      return NextResponse.json({ datasets: list });
    }
  } catch (err) {
    console.warn('DB query datasets fallback:', err);
  }

  // Fallback demo datasets
  const demoList = DEMO_CSV_DATASETS.map((d, idx) => {
    const { rows, columns } = parseAndValidateCSV(d.content);
    const stats = calculateDeterministicStats(rows, columns);

    return {
      id: `ds-demo-00${idx + 1}`,
      workspaceId,
      uploadedBy: 'usr-admin-001',
      name: d.name,
      fileName: d.name,
      fileSize: Buffer.byteLength(d.content),
      storagePath: `/demo/${d.name}`,
      rowCount: rows.length,
      columnCount: columns.length,
      columns: columns.map((c) => ({ name: c, type: typeof rows[0]?.[c] === 'number' ? 'numeric' as const : 'categorical' as const })),
      calculatedStats: stats,
      aiSummary: {
        keyFindings: [
          `Total enrolled participants recorded: ${stats.totalParticipants}.`,
          `Average programme completion rate stands at ${stats.completionRate}%.`,
          `Referral rate to clinical partner facilities: ${stats.referralRate}%.`,
        ],
        trends: ['Consistent participation growth Q1 through Q3.', 'East Coast district recorded highest outcome rate (92.0%).'],
        anomalies: ['Southern Valley reported lower completion (76.3%), coinciding with transportation challenges.'],
        dataQuality: ['0.0% missing data in key indicator metrics.'],
        furtherQuestions: ['What specific transportation mechanisms contributed to East Coast high completion?'],
      },
      createdAt: new Date(Date.now() - idx * 3600000 * 24),
    };
  });

  return NextResponse.json({ datasets: demoList });
}
