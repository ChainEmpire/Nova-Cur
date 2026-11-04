const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  OPS: 'ops',
  SECURITY: 'security',
  ANALYST: 'analyst',
  SUPPORT: 'support',
};

const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: ['*'],
  [ADMIN_ROLES.OPS]: [
    'overview:read',
    'users:read',
    'users:write',
    'trading:read',
    'trading:write',
    'liquidity:read',
    'liquidity:write',
    'activity:read',
    'stats:read',
  ],
  [ADMIN_ROLES.SECURITY]: [
    'overview:read',
    'contracts:read',
    'contracts:write',
    'users:read',
    'activity:read',
    'auth:audit',
  ],
  [ADMIN_ROLES.ANALYST]: [
    'overview:read',
    'users:read',
    'trading:read',
    'liquidity:read',
    'activity:read',
    'stats:read',
    'contracts:read',
  ],
  [ADMIN_ROLES.SUPPORT]: ['overview:read', 'users:read', 'users:write', 'activity:read'],
};

const ADMIN_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@novafi.app',
    password: 'admin2026',
    name: 'Super Admin',
    role: ADMIN_ROLES.SUPER_ADMIN,
  },
  {
    id: 2,
    email: 'ops@novafi.app',
    password: 'ops2026',
    name: 'Ops Manager',
    role: ADMIN_ROLES.OPS,
  },
  {
    id: 3,
    email: 'security@novafi.app',
    password: 'security2026',
    name: 'Security Lead',
    role: ADMIN_ROLES.SECURITY,
  },
];

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;

  const [resource] = permission.split(':');
  return permissions.includes(`${resource}:read`) && permission.endsWith(':read');
}

function findAdminAccount(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return ADMIN_ACCOUNTS.find(
    (account) =>
      account.email === normalizedEmail && String(password || '') === account.password
  );
}

function findAdminById(id) {
  return ADMIN_ACCOUNTS.find((account) => account.id === id) || null;
}

module.exports = {
  ADMIN_ROLES,
  ROLE_PERMISSIONS,
  ADMIN_ACCOUNTS,
  hasPermission,
  findAdminAccount,
  findAdminById,
};
