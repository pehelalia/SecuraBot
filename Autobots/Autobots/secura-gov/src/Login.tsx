import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate } from './auth';
import { addLog } from './logUtils';

export default function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutExpires, setLockoutExpires] = useState<number | null>(null);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION_MS = 1000 * 60; // 1 minute (adjust as needed)

  // if already authenticated, go to dashboard immediately
  useEffect(() => {
    if (localStorage.getItem('role')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // load attempt state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('loginAttempts');
    if (saved) {
      try {
        const obj = JSON.parse(saved) as { count: number; expiry: number | null };
        const now = Date.now();
        if (obj.expiry && now > obj.expiry) {
          // expired lockout, reset
          localStorage.removeItem('loginAttempts');
        } else {
          setAttempts(obj.count);
          setLockoutExpires(obj.expiry);
        }
      } catch {
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const now = Date.now();
    if (lockoutExpires && now < lockoutExpires) {
      setError(
        `Account locked. Try again in ${Math.ceil((lockoutExpires - now) / 1000)} seconds.`
      );
      // record lockout access attempt
      addLog({ type: 'lockout', actor: id.trim(), message: 'Attempted login during lockout' });
      return;
    }

    setLoading(true);
    setError('');
    
    const role = authenticate(id.trim(), password);
    if (role) {
      // successful login resets attempts
      localStorage.removeItem('loginAttempts');
      setAttempts(0);
      setLockoutExpires(null);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', id.trim());
      // redirect to dashboard
      navigate('/', { replace: true });
    } else {
      setError('Invalid credentials');
      setLoading(false);

      // log failure
      addLog({ type: 'failed_login', actor: id.trim(), message: `Attempt ${attempts + 1}` });

      // increment attempts and potentially lock out
      const newCount = attempts + 1;
      let expiry: number | null = null;
      if (newCount >= MAX_ATTEMPTS) {
        expiry = Date.now() + LOCKOUT_DURATION_MS;
        setError(`Too many failed attempts. Try again in ${Math.ceil(
          LOCKOUT_DURATION_MS / 1000
        )} seconds.`);
        // record lockout event as well
        addLog({ type: 'lockout', actor: id.trim(), message: 'User locked out due to repeated failures' });
      }
      setAttempts(newCount);
      setLockoutExpires(expiry);
      localStorage.setItem(
        'loginAttempts',
        JSON.stringify({ count: newCount, expiry })
      );
    }
  }

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <form className="border p-4 rounded" style={{ width: '320px' }} onSubmit={handleSubmit}>
        <h3 className="mb-3 text-center">Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {!error && attempts > 0 && attempts < MAX_ATTEMPTS && (
          <div className="alert alert-warning">
            {`Failed attempts: ${attempts} / ${MAX_ATTEMPTS}`}
          </div>
        )}
        <div className="mb-3">
          <label className="form-label">User ID</label>
          <input
            type="text"
            className="form-control"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={
            loading || (lockoutExpires ? Date.now() < lockoutExpires : false)
          }
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
