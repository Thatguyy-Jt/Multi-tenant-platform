/**
 * Role Definitions
 */
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  SUPER_ADMIN: 'super_admin',
};

/**
 * Permission Definitions
 * (Future-proofing: Map permissions to roles if we switch to granular permission checks)
 */
export const PERMISSIONS = {
  // Organization
  MANAGE_ORGANIZATION: 'manage_organization', // Update settings, delete org
  MANAGE_BILLING: 'manage_billing', // Subscribe, update plan

  // Members & Invitations
  INVITE_USERS: 'invite_users',
  MANAGE_MEMBERS: 'manage_members', // Change roles, remove members
  CANCEL_INVITATIONS: 'cancel_invitations',

  // Projects (Future)
  CREATE_PROJECTS: 'create_projects',
  DELETE_PROJECTS: 'delete_projects',
  MANAGE_PROJECTS: 'manage_projects', // Edit any project

  // Tasks (Future)
  CREATE_TASKS: 'create_tasks',
  MANAGE_TASKS: 'manage_tasks',
};

/**
 * Role Permission Matrix
 * Defines which roles have which permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    // Super admin has system-wide access, permissions might not apply standardly
    Object.values(PERMISSIONS),
  ].flat(),
  [ROLES.OWNER]: [
    Object.values(PERMISSIONS), // Owner has all permissions within tenant
  ].flat(),
  [ROLES.ADMIN]: [
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.CANCEL_INVITATIONS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.CREATE_TASKS,
    PERMISSIONS.MANAGE_TASKS,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.CREATE_TASKS,
    // Members usually have access to projects they are assigned to
  ],
};
