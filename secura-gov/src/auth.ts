export interface User {
  username: string;
  password: string;
  role: string;
}

// all mock accounts use the same base password for simplicity
const PASSWORD = 'Password!1';

const mockUsers: User[] = [
  { username: 'viewer1', password: PASSWORD, role: 'viewer' },
  { username: 'guest1', password: PASSWORD, role: 'guest' },
  { username: 'employee1', password: PASSWORD, role: 'employee' },
  { username: 'analyst1', password: PASSWORD, role: 'analyst' },
  { username: 'manager1', password: PASSWORD, role: 'manager' },
  { username: 'approver1', password: PASSWORD, role: 'approver' },
  { username: 'secadmin', password: PASSWORD, role: 'security_admin' },
  { username: 'platform', password: PASSWORD, role: 'platform_admin' },
];

export function authenticate(username: string, password: string): string | null {
  const u = mockUsers.find(
    (u) => u.username === username && u.password === password
  );
  return u ? u.role : null;
}

export function getMockUsers(): User[] {
  return mockUsers;
}

// mutations for admin page
export function addMockUser(user: User) {
  mockUsers.push(user);
}

export function removeMockUser(username: string) {
  const idx = mockUsers.findIndex(u => u.username === username);
  if (idx !== -1) mockUsers.splice(idx, 1);
}
