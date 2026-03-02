import MetricCard from './components/MetricCard';
import SearchBox from './components/SearchBox';
import { getRole, isViewerOrGuest } from './roleUtils';

interface DashboardProps {
  navigate?: (path: string) => void;
}

interface RecentRequest {
  id: string;
  resource: string;
  status: 'pending' | 'approved' | 'denied';
  requestedBy: string;
  date: string;
}

interface RiskTrendData {
  month: string;
  score: number;
}

const recentRequestsData: RecentRequest[] = [
  { id: 'REQ-1001', resource: 'Production Database', status: 'pending', requestedBy: 'john_doe', date: '2026-02-26' },
  { id: 'REQ-1000', resource: 'Admin Dashboard', status: 'approved', requestedBy: 'jane_smith', date: '2026-02-25' },
  { id: 'REQ-0999', resource: 'Git Repository', status: 'approved', requestedBy: 'bob_johnson', date: '2026-02-25' },
  { id: 'REQ-0998', resource: 'CI/CD Pipeline', status: 'denied', requestedBy: 'alice_wonder', date: '2026-02-24' },
];

const riskTrendData: RiskTrendData[] = [
  { month: 'Mar', score: 32 },
  { month: 'Apr', score: 35 },
  { month: 'May', score: 38 },
  { month: 'Jun', score: 42 },
  { month: 'Jul', score: 48 },
  { month: 'Aug', score: 45 },
  { month: 'Sep', score: 50 },
  { month: 'Oct', score: 42 },
  { month: 'Nov', score: 38 },
  { month: 'Dec', score: 42 },
  { month: 'Jan', score: 38 },
  { month: 'Feb', score: 45 },
];

export default function Dashboard({ navigate }: DashboardProps) {
  const role = getRole();
  const tier1 = isViewerOrGuest(role);
  const canRequest = ['viewer', 'employee', 'analyst', 'manager', 'approver'].includes(role);
  const canApprove = ['manager', 'approver', 'security_admin', 'platform_admin'].includes(role);
  const canManageUsers = ['security_admin', 'platform_admin'].includes(role);
  const canViewLogs = ['manager', 'security_admin', 'platform_admin'].includes(role);
  const userId = localStorage.getItem('userId') || '';

  function handleLogout() {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    if (navigate) navigate('/login');
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#0F0F0F', color: '#E0E0E0' }}>
      {/* HEADER – simplified, grey bar removed, options are now buttons; search and actions on one line */}
      <div className="d-flex align-items-center justify-content-between py-2 px-3">
        {/* brand text instead of logo image */}
        <a
          className="btn btn-link p-0 text-white fs-4 fw-bold"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // log out and send to login
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            if (navigate) navigate('/login');
          }}
        >
          SecuraBot
        </a>

        <div className="d-flex align-items-center flex-grow-1 ms-3">
          {/* search box with fixed width */}
          {!tier1 && (
            <div className="me-3" style={{ width: '250px' }}>
              <SearchBox
                options={[
                  'Git Repository',
                  'Database',
                  'CI/CD Pipeline',
                  'Admin Dashboard',
                  'Production Server',
                  'HR System',
                  'Email Service',
                ]}
                onSelect={(val) => {
                  if (navigate) navigate(`/resource/${encodeURIComponent(val)}`);
                }}
              />
            </div>
          )}

          {/* quick action buttons moved into header */}
          {canRequest && (
            <button
              className="btn btn-primary me-2"
              onClick={() => navigate && navigate('/request')}
            >
              New Request
            </button>
          )}
          {canApprove && (
            <button
              className="btn btn-success me-2"
              onClick={() => navigate && navigate('/approve')}
            >
              Approve Requests
            </button>
          )}
          {canViewLogs && (
            <button className="btn btn-success me-2" onClick={() => navigate && navigate('/logs')}>
              Logs
            </button>
          )}
          {canManageUsers && (
            <button className="btn btn-success me-2" onClick={() => navigate && navigate('/users')}>
              Manage Users
            </button>
          )}
        </div>

        {/* user info and logout button */}
        <div className="d-flex align-items-center">
          <span className={`me-2 text-uppercase small ${role === 'platform_admin' ? 'text-secondary' : 'text-muted'}`}>
            {userId ? `${userId} (${role})` : role || 'guest'}
          </span>
          <button className="btn btn-outline-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* quick actions – only show new request below header; others moved to top bar */}
      <div className="container py-3">
        {canRequest && (
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate && navigate('/request')}
          >
            New Request
          </button>
        )}
      </div>
      {/* MAIN GRID */}
      <main id="dashboard-report" className="container py-4">
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-secondary" onClick={() => {
            import('./pdfUtils').then(({ exportById }) => exportById('dashboard-report', 'dashboard.pdf')).catch(console.error);
          }}>
            Download PDF
          </button>
        </div>
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <MetricCard title="Pending Requests" value={247} trend="+12%" className="flex-fill" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <MetricCard title="Avg Approval Time" value="2.3h" className="flex-fill" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <MetricCard title="Compliance Rate" value="98.7%" className="flex-fill" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <MetricCard title="Risk Score" value="Medium" className="flex-fill" />
          </div>
        </div>

        <div className="row g-3 mt-4">
          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Recent Requests</h5>
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Resource</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequestsData.map((req) => (
                      <tr key={req.id}>
                        <td className="fw-bold">{req.id}</td>
                        <td>{req.resource}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                req.status === 'approved'
                                  ? '#4CAF50'
                                  : req.status === 'pending'
                                    ? '#FFC107'
                                    : '#F44336',
                            }}
                          >
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="text-muted small">{req.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Risk Trends</h5>
                
                {/* Legend */}
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', borderRadius: '2px' }} />
                    <span style={{ color: '#f0f0f0' }}>Low Risk (0-40)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#FFC107', borderRadius: '2px' }} />
                    <span style={{ color: '#f0f0f0' }}>Medium Risk (40-70)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#E91E63', borderRadius: '2px' }} />
                    <span style={{ color: '#f0f0f0' }}>High Risk (70+)</span>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ position: 'relative', paddingLeft: '40px' }}>
                  {/* Y-axis labels */}
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#999', width: '35px', textAlign: 'right', paddingRight: '5px' }}>
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>

                  {/* Chart bars */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '260px', gap: '0.5rem', borderLeft: '2px solid #666', borderBottom: '2px solid #666', paddingBottom: '1rem' }}>
                    {riskTrendData.map((trend) => {
                      const getColor = (score: number) => {
                        if (score < 40) return '#4CAF50';
                        if (score < 70) return '#FFC107';
                        return '#E91E63';
                      };
                      return (
                        <div key={trend.month} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              height: `${trend.score * 2.6}px`,
                              backgroundColor: getColor(trend.score),
                              borderRadius: '6px 6px 0 0',
                              width: '100%',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: `0 -4px 8px ${getColor(trend.score)}40`,
                              minHeight: '4px',
                            }}
                            className="risk-bar"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                              e.currentTarget.style.transform = 'scaleY(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.transform = 'scaleY(1)';
                            }}
                          />
                          <small style={{ color: '#f0f0f0', fontWeight: '600', marginTop: '0.5rem' }}>{trend.month}</small>
                          <span style={{ color: getColor(trend.score), fontSize: '0.75rem', fontWeight: '700' }}>{trend.score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Average indicator */}
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#2a2a3e', borderRadius: '6px', fontSize: '0.875rem', color: '#f0f0f0', textAlign: 'center' }}>
                  Average Risk Score: <span style={{ fontWeight: '700', color: '#FF69B4' }}>{Math.round(riskTrendData.reduce((sum, t) => sum + t.score, 0) / riskTrendData.length)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">All Requests</h5>
              <p className="card-text text-muted">(placeholder for data table)</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-3" style={{ backgroundColor: '#0B2447', borderTop: '2px solid #E91E63', color: '#E0E0E0' }}>
        <small>© 2026 SecuraGov</small>
      </footer>
    </div>
  );
}
