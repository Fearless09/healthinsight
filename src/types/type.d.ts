import { UserRole } from "@/db/schema";

export type Compare = {
  doc1Name: any;
  doc2Name: any;
  commonFindings: string[];
  differentFindings: string[];
  metricComparison: {
    metric: string;
    doc1: string;
    doc2: string;
  }[];
  outcomeVariations: string[];
  summary: string;
  disclaimer: string;
};

export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: Date;
};

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
}

export interface AuditEvent {
  workspaceId: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  metadata?: Record<string, any>;
}