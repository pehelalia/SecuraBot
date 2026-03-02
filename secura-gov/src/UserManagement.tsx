import { useState } from 'react';
import { getMockUsers, addMockUser, removeMockUser } from './auth';
import type { User } from './auth';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(getMockUsers());
  const [form, setForm] = useState<User>({ username: '', password: '', role: '' });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (form.username && form.password && form.role) {
      addMockUser({ ...form });
      setUsers(getMockUsers());
      setForm({ username: '', password: '', role: '' });
    }
  }

  return (
    <div className="container py-4">
      <h2>User Management</h2>
      <p>Only security_admin and platform_admin can access this page.</p>

      <form onSubmit={handleAdd} className="mb-4">
        <div className="row g-2">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="col">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-success">Add</button>
          </div>
        </div>
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    removeMockUser(u.username);
                    setUsers(getMockUsers());
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/" className="btn btn-secondary mt-3">Back to Dashboard</Link>
    </div>
  );
}
