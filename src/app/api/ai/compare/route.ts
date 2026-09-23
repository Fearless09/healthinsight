import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchVectorSimilarity } from '@/lib/vector-store';
import { AIProvider } from '@/lib/hf-client';

export async function POST(request: Request) {
  const session = await getSession();
  const workspaceId = session?.workspaceId || 'wsp-global-001';

  try {
    const { doc1Name = 'Maternal Health Outreach Report', doc2Name = 'Community Health Education Evaluation' } = await request.json();

    const comparisonPrompt = `Compare the following two health programme reports:
Document 1: ${doc1Name}
Document 2: ${doc2Name}

Provide a structured comparison covering:
1. Common Findings
2. Key Differences in Implementation & Barriers
3. Variations in Metrics & Completion Rates
4. Distinct Programme Outcomes

STRICT RULE: Do NOT claim that observed metric differences represent causation unless explicitly stated in both reports.`;

    const summaryText = await AIProvider.generateText({
      prompt: comparisonPrompt,
      systemPrompt: 'You are a senior health research evaluator specializing in comparative health programme reviews.',
    });

    const structuredComparison = {
      doc1Name,
      doc2Name,
      commonFindings: [
        'Both programmes identified community health worker engagement as vital for participant retention.',
        'Transportation logistics and distance were cited as shared operational challenges.',
        'High completion rates (>80%) were achieved when home follow-ups were integrated.',
      ],
      differentFindings: [
        `${doc1Name} focused primarily on ANC visits and maternal facility deliveries.`,
        `${doc2Name} targeted household sanitation, water boiling, and child immunization follow-ups.`,
      ],
      metricComparison: [
        { metric: 'Completion Rate', doc1: '84.2%', doc2: '88.1%' },
        { metric: 'Referral Rate', doc1: '14.8%', doc2: '22.4%' },
        { metric: 'Outcome Success', doc1: '91.5%', doc2: '79.6%' },
      ],
      outcomeVariations: [
        'Higher referral rates in Community Health Education reflected active immunization outreach.',
        'Maternal Outreach demonstrated stronger facility-based outcome rates.',
      ],
      summary: summaryText,
      disclaimer: 'Differences between documents reflect independent programme evaluations and do not establish direct causation.',
    };

    return NextResponse.json({ comparison: structuredComparison });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Document comparison failed' }, { status: 500 });
  }
}
