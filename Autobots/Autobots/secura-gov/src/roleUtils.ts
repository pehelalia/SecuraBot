// helper utilities for role and tier logic

export function getRole() {
  return (localStorage.getItem('role') || '').toLowerCase();
}

// tier1 are "viewer" and "guest" users with very limited access
export function isViewerOrGuest(role: string) {
  return ['viewer', 'guest'].includes(role);
}

export function isTier2(role: string) {
  return ['employee', 'analyst', 'manager'].includes(role);
}

export function isApprover(role: string) {
  return ['approver', 'security_admin'].includes(role);
}

export function isAdmin(role: string) {
  return role === 'platform_admin';
}
