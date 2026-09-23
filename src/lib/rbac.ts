export type Role = 'ADMIN' | 'PROGRAMME_MANAGER' | 'RESEARCHER' | 'VIEWER';

export interface Permission {
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canUploadDatasets: boolean;
  canAskAI: boolean;
  canCreateReports: boolean;
  canManageTeam: boolean;
  canViewAuditLogs: boolean;
  canManageWorkspace: boolean;
}

const ROLE_PERMISSIONS: Record<Role, Permission> = {
  ADMIN: {
    canUploadDocuments: true,
    canDeleteDocuments: true,
    canUploadDatasets: true,
    canAskAI: true,
    canCreateReports: true,
    canManageTeam: true,
    canViewAuditLogs: true,
    canManageWorkspace: true,
  },
  PROGRAMME_MANAGER: {
    canUploadDocuments: true,
    canDeleteDocuments: true,
    canUploadDatasets: true,
    canAskAI: true,
    canCreateReports: true,
    canManageTeam: false,
    canViewAuditLogs: false,
    canManageWorkspace: false,
  },
  RESEARCHER: {
    canUploadDocuments: true,
    canDeleteDocuments: false,
    canUploadDatasets: true,
    canAskAI: true,
    canCreateReports: true,
    canManageTeam: false,
    canViewAuditLogs: false,
    canManageWorkspace: false,
  },
  VIEWER: {
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canUploadDatasets: false,
    canAskAI: true,
    canCreateReports: false,
    canManageTeam: false,
    canViewAuditLogs: false,
    canManageWorkspace: false,
  },
};

export function getPermissions(role: Role): Permission {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;
}

export function hasPermission(role: Role, action: keyof Permission): boolean {
  const permissions = getPermissions(role);
  return permissions[action] ?? false;
}
