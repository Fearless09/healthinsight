import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "PROGRAMME_MANAGER",
  "RESEARCHER",
  "VIEWER",
]);
export const userRoles = userRoleEnum.enumValues;
export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
export type DocumentStatus = (typeof documentStatusEnum.enumValues)[number];

export const reportStatusEnum = pgEnum("report_status", ["DRAFT", "GENERATED"]);
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];

// Vector custom type for pgvector (384 dimensions for all-MiniLM-L6-v2)
export const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(384)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map(Number);
      }
    }
    return value as number[];
  },
});

// 1. Users
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").default("RESEARCHER").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

// 2. Workspaces
export const workspaces = pgTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Workspace Members (RBAC junction table)
export const workspaceMembers = pgTable("workspace_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").default("RESEARCHER").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// 4. Documents
export const documents = pgTable("documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(), // 'pdf' | 'docx' | 'txt'
  fileSize: integer("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  status: documentStatusEnum("status").default("UPLOADED").notNull(),
  pageCount: integer("page_count").default(0).notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  summary: text("summary"),
  extractedFindings: jsonb("extracted_findings").$type<string[]>().default([]),
  hasPiiDetected: boolean("has_pii_detected").default(false).notNull(),
  piiSummary: jsonb("pii_summary")
    .$type<{ count: number; types: string[] }>()
    .default({ count: 0, types: [] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});
export type Document = typeof documents.$inferSelect;

// 5. Document Chunks (RAG pgvector table)
export const documentChunks = pgTable("document_chunks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  pageNumber: integer("page_number").default(1).notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embedding"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Datasets (Structured CSV Analytics)
export const datasets = pgTable("datasets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  rowCount: integer("row_count").default(0).notNull(),
  columnCount: integer("column_count").default(0).notNull(),
  columns: jsonb("columns")
    .$type<Array<{ name: string; type: "numeric" | "categorical" | "date" }>>()
    .default([]),
  calculatedStats: jsonb("calculated_stats")
    .$type<Record<string, any>>()
    .default({}),
  aiSummary: jsonb("ai_summary").$type<{
    keyFindings: string[];
    trends: string[];
    anomalies: string[];
    dataQuality: string[];
    furtherQuestions: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type Dataset = typeof datasets.$inferSelect;

// 7. Dataset Rows (stored structured data)
export const datasetRows = pgTable("dataset_rows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  datasetId: text("dataset_id")
    .notNull()
    .references(() => datasets.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  rowIndex: integer("row_index").notNull(),
  data: jsonb("data").$type<Record<string, any>>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. AI Conversations
export const aiConversations = pgTable("ai_conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 9. AI Messages
export const aiMessages = pgTable("ai_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  citations: jsonb("citations")
    .$type<
      Array<{
        documentId: string;
        documentName: string;
        pageNumber: number;
        snippet: string;
      }>
    >()
    .default([]),
  groundingScore: real("grounding_score").default(1.0),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Reports
export const reports = pgTable("reports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").default("DRAFT").notNull(),
  documentIds: jsonb("document_ids").$type<string[]>().default([]),
  datasetIds: jsonb("dataset_ids").$type<string[]>().default([]),
  sections: jsonb("sections")
    .$type<
      Array<{
        title: string;
        content: string;
        metrics?: Record<string, any>;
        chartType?: string;
      }>
    >()
    .default([]),
  exportUrl: text("export_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Report = typeof reports.$inferSelect;

// 11. Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userEmail: text("user_email").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Audit = typeof auditLogs.$inferSelect;
