import { useParams, Link, Navigate } from 'react-router-dom';
import { getRole, isViewerOrGuest } from './roleUtils';

const sensitivities = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ResourcePage() {
  const role = getRole();
  if (isViewerOrGuest(role)) {
    // tier‑1 users aren't allowed to see resource details
    return <Navigate to="/" replace />;
  }
  const { name } = useParams<{ name: string }>();

  const sensitivity = randomChoice(sensitivities);
  const requests = Array.from({ length: 5 }).map((_, i) => ({
    id: `req-${i + 1}`,
    user: `user${i + 1}@mocksoft.com`,
    status: randomChoice(statuses),
    risk: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="container py-4">
      <h2>Resource: {name}</h2>
      <p>Sensitivity: <strong>{sensitivity}</strong></p>
      <h3 className="mt-4">Recent Access Requests</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Status</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.user}</td>
              <td>{r.status}</td>
              <td>{r.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/" className="btn btn-secondary mt-3">Back to Dashboard</Link>
    </div>
  );
}
