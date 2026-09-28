import { db } from "./index";
import {
  users,
  workspaces,
  workspaceMembers,
  documents,
  datasets,
} from "./schema";
import { hashPassword } from "@/lib/auth";
import { detectAndRedactPii } from "@/lib/pii-detector";
import { chunkDocumentPages } from "@/lib/doc-parser";
import { AIProvider } from "@/lib/hf-client";
import { storeDocumentChunkVector } from "@/lib/vector-store";
import {
  calculateDeterministicStats,
  parseAndValidateCSV,
} from "@/lib/stats-engine";

export const DEMO_HEALTH_REPORTS = [
  {
    name: "Maternal Health Outreach Programme Report.txt",
    fileType: "txt",
    content: `
MATERNAL HEALTH OUTREACH PROGRAMME - ANNUAL EVALUATION REPORT
Synthetic Demonstration Data — Not Real Patient Information.

EXECUTIVE SUMMARY
The Maternal Health Outreach Programme was implemented across 4 rural districts (North District, Central Region, Southern Valley, East Coast) to expand access to antenatal care, nutritional support, and safe facility-based delivery services for expectant mothers.

PROGRAMME PERFORMANCE & KEY METRICS
Over the 12-month implementation period, the programme enrolled 1,450 pregnant women across participating community clinics.
- Total Enrolled Participants: 1,450
- Antenatal Care Completion Rate: 84.2% (1,221 mothers completed all 4 scheduled ANC visits)
- Referral Rate for High-Risk Cases: 14.8% (215 referrals to tertiary hospitals)
- Facility-Based Delivery Outcome Rate: 91.5% among enrolled mothers.

BARRIERS TO HEALTHCARE ACCESS
Key challenges identified during community health worker surveys (Page 17):
1. Transportation Costs: 42% of mothers cited distance to healthcare facilities and transportation costs as the primary barrier to timely ANC visits.
2. Emergency Transport Delays: In Southern Valley, ambulance dispatch times averaged 85 minutes due to unpaved roads.
3. Healthcare Worker Shortages: Nurse midwife to patient ratio remained at 1:1,200, exceeding national guidelines of 1:500.

INTERVENTIONS & RESULTS
The introduction of mobile community ultrasound vans in Month 6 led to a 28% increase in early trimester registrations.
Community emergency transport funds managed by local committees reduced delay to care by 34% in pilot villages.

RECOMMENDATIONS FOR PROGRAMME MANAGEMENT
1. Expand emergency transport voucher system to all 4 districts.
2. Increase midwife staffing at primary health centers.
3. Maintain community health worker home visits for post-natal follow-up.
`.trim(),
  },
  {
    name: "Community Health Education Programme Evaluation.txt",
    fileType: "txt",
    content: `
COMMUNITY HEALTH EDUCATION & DISEASE PREVENTION PROGRAMME
Synthetic Demonstration Data — Not Real Patient Information.

BACKGROUND & OBJECTIVES
This programme aimed to increase health literacy, sanitation practices, and immunization coverage among rural households across 5 health facility catchment areas.

KEY METRICS & PERFORMANCE OVERVIEW
- Enrolled Households: 2,100
- Health Workshop Attendance: 1,850 participants (88.1% completion rate)
- Vaccination Follow-Up Referral Rate: 22.4% (414 children referred for missing immunizations)
- Hygiene Adoption Outcome Rate: 79.6% demonstrated proper handwashing and water boiling.

GROUNDED SURVEY FINDINGS (Page 24)
- Community surveys indicated that peer health educators achieved higher retention rates (89%) compared to standard poster campaigns (45%).
- Information gaps persisted regarding childhood fever management and early signs of dehydration.

RECOMMENDATIONS
1. Integrate interactive demonstration kits into weekly health education sessions.
2. Establish SMS reminder alerts for child immunization dates.
`.trim(),
  },
  {
    name: "Adolescent Health Awareness Programme Report.txt",
    fileType: "txt",
    content: `
ADOLESCENT HEALTH & NUTRITION AWARENESS PROGRAMME
Synthetic Demonstration Data — Not Real Patient Information.

PROGRAMME OVERVIEW
The Adolescent Health Awareness initiative focused on secondary school health clubs, nutritional screening, mental health awareness, and reproductive health education.

KEY STATISTICAL OUTCOMES
- Enrolled School Participants: 1,200 students
- Workshop Completion Rate: 76.5% (918 students)
- Specialized Counseling Referral Rate: 9.2% (110 students referred)
- Nutrition Knowledge Outcome Rate: 85.0%

KEY BARRIERS & CHALLENGES (Page 31)
- Stigma associated with attending mental health counseling sessions.
- Inconsistent supply of iron-folic acid supplements at school clinics during Quarter 2.

STRATEGIC DIRECTIVES
1. Rename counseling centers to Youth Wellness Hubs to minimize social stigma.
2. Strengthen supply chain logistics for micronutrient supplements.
`.trim(),
  },
];

export const DEMO_CSV_DATASETS = [
  {
    name: "Programme_Participation_Dataset_2025.csv",
    content: `location,participants,completed,referred,outcome_rate,date
North District,350,295,48,84.3,2025-01-15
Central Region,420,360,65,85.7,2025-02-15
Southern Valley,380,290,72,76.3,2025-03-15
East Coast,300,276,30,92.0,2025-04-15
Highland Zone,250,200,35,80.0,2025-05-15
Metro Fringe,400,350,42,87.5,2025-06-15
Riverland Site,320,260,50,81.2,2025-07-15
Western Outpost,280,210,55,75.0,2025-08-15`,
  },
  {
    name: "Maternal_Outreach_Performance.csv",
    content: `location,participants,completed,referred,outcome_rate,date
District A - Primary Clinic,180,155,22,86.1,2025-01-10
District B - Outpost Clinic,140,110,28,78.6,2025-02-10
District C - General Hospital,220,195,30,88.6,2025-03-10
District D - Mobile Unit,160,135,25,84.4,2025-04-10
District E - Rural Center,190,145,40,76.3,2025-05-10`,
  },
];

export async function seedDemoData() {
  console.log("Seeding synthetic demonstration data...");

  // 1. Create Default Users for Demo
  const adminPassword = await hashPassword("AdminPass123!");
  const defaultPassword = await hashPassword("DemoPass123!");

  const adminUser = {
    id: "usr-admin-001",
    email: "admin@healthinsight.org",
    passwordHash: adminPassword,
    name: "Dr. Sarah Jenkins (Admin)",
    role: "ADMIN" as const,
  };

  const pmUser = {
    id: "usr-pm-002",
    email: "pm@healthinsight.org",
    passwordHash: defaultPassword,
    name: "Alex Rivera (Programme Manager)",
    role: "PROGRAMME_MANAGER" as const,
  };

  const researcherUser = {
    id: "usr-researcher-003",
    email: "researcher@healthinsight.org",
    passwordHash: defaultPassword,
    name: "Dr. Marcus Vance (Lead Researcher)",
    role: "RESEARCHER" as const,
  };

  const viewerUser = {
    id: "usr-viewer-004",
    email: "viewer@healthinsight.org",
    passwordHash: defaultPassword,
    name: "Elena Rostova (Stakeholder Viewer)",
    role: "VIEWER" as const,
  };

  try {
    await db
      .insert(users)
      .values([adminUser, pmUser, researcherUser, viewerUser])
      .onConflictDoNothing();
  } catch (err) {
    console.warn("User seed note:", err);
  }

  // 2. Create Default Workspace
  const demoWorkspace = {
    id: "wsp-global-001",
    name: "Global Health Outreach Workspace",
    slug: "global-health-outreach",
    description:
      "Main workspace for maternal, community, and adolescent health programme analysis.",
    createdById: adminUser.id,
  };

  try {
    await db.insert(workspaces).values(demoWorkspace).onConflictDoNothing();

    await db
      .insert(workspaceMembers)
      .values([
        {
          id: "wm-1",
          workspaceId: demoWorkspace.id,
          userId: adminUser.id,
          role: "ADMIN",
        },
        {
          id: "wm-2",
          workspaceId: demoWorkspace.id,
          userId: pmUser.id,
          role: "PROGRAMME_MANAGER",
        },
        {
          id: "wm-3",
          workspaceId: demoWorkspace.id,
          userId: researcherUser.id,
          role: "RESEARCHER",
        },
        {
          id: "wm-4",
          workspaceId: demoWorkspace.id,
          userId: viewerUser.id,
          role: "VIEWER",
        },
      ])
      .onConflictDoNothing();
  } catch (err) {
    console.warn("Workspace seed note:", err);
  }

  // 3. Process & Seed Synthetic Documents
  for (let i = 0; i < DEMO_HEALTH_REPORTS.length; i++) {
    const report = DEMO_HEALTH_REPORTS[i];
    const docId = `doc-demo-00${i + 1}`;

    const piiResult = detectAndRedactPii(report.content);
    const pages = [{ pageNumber: 1, text: piiResult.redactedText }];
    const chunks = chunkDocumentPages(pages);

    const docObj = {
      id: docId,
      workspaceId: demoWorkspace.id,
      uploadedBy: adminUser.id,
      name: report.name,
      fileType: report.fileType,
      fileSize: Buffer.byteLength(report.content),
      storagePath: `/demo/${report.name}`,
      status: "COMPLETED" as const,
      pageCount: 1,
      wordCount: report.content.split(/\s+/).length,
      summary: `Synthetic Health Report evaluating key metrics, completion rates, and systemic barriers across health districts.`,
      extractedFindings: [
        "Maternal ANC completion reached 84.2% across participating rural health centers.",
        "Transportation cost was cited as the primary barrier to emergency care access.",
        "Community emergency transport funds reduced delay to care by 34% in pilot villages.",
      ],
      hasPiiDetected: piiResult.piiFound,
      piiSummary: {
        count: piiResult.totalCount,
        types: piiResult.detectedTypes,
      },
      processedAt: new Date(),
    };

    try {
      await db.insert(documents).values(docObj).onConflictDoNothing();

      for (const chunk of chunks) {
        const embedding = await AIProvider.generateEmbedding(chunk.content);
        await storeDocumentChunkVector({
          documentId: docId,
          workspaceId: demoWorkspace.id,
          documentName: report.name,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          embedding,
        });
      }
    } catch (err) {
      console.warn("Doc seed note:", err);
    }
  }

  // 4. Seed Synthetic Datasets
  for (let i = 0; i < DEMO_CSV_DATASETS.length; i++) {
    const datasetDef = DEMO_CSV_DATASETS[i];
    const datasetId = `ds-demo-00${i + 1}`;

    const { rows, columns } = parseAndValidateCSV(datasetDef.content);
    const stats = calculateDeterministicStats(rows, columns);

    const datasetObj = {
      id: datasetId,
      workspaceId: demoWorkspace.id,
      uploadedBy: adminUser.id,
      name: datasetDef.name,
      fileName: datasetDef.name,
      fileSize: Buffer.byteLength(datasetDef.content),
      storagePath: `/demo/${datasetDef.name}`,
      rowCount: rows.length,
      columnCount: columns.length,
      columns: columns.map((c) => ({
        name: c,
        type:
          typeof rows[0]?.[c] === "number"
            ? ("numeric" as const)
            : ("categorical" as const),
      })),
      calculatedStats: stats,
      aiSummary: {
        keyFindings: [
          `Total participants recorded across sites: ${stats.totalParticipants}.`,
          `Average programme completion rate stands at ${stats.completionRate}%.`,
          `Referral rate to clinical specialist facilities is ${stats.referralRate}%.`,
        ],
        trends: [
          "Participation increased steadily over Q1-Q3.",
          "East Coast site demonstrated highest outcome rate (92.0%).",
        ],
        anomalies: [
          "Southern Valley site recorded lower completion (76.3%) due to local logistics.",
        ],
        dataQuality: ["0.0% missing data across key indicator fields."],
        furtherQuestions: [
          "What specific transportation mechanisms contributed to East Coast high completion?",
        ],
      },
    };

    try {
      await db.insert(datasets).values(datasetObj).onConflictDoNothing();
    } catch (err) {
      console.warn("Dataset seed note:", err);
    }
  }

  console.log("Seed completed successfully!");
}
