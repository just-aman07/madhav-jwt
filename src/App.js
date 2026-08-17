import { useState } from 'react';
import './App.css';
import Sidebar from './components/sidebar';
import RoadRoute from './components/roadroute';
import { AuthProvider, useAuth } from './features/authSlice';

function AppShell() {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [route, setRoute] = useState('compose');
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@jwt.local');
  const [password, setPassword] = useState('Admin@123');
  const [feedback, setFeedback] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setFeedback('');

    try {
      await login({ email, password, role });
      setFeedback('JWT session created successfully.');
    } catch (error) {
      setFeedback(error.message);
    }
  };

  const roleLabel = role === 'creator' ? 'Creator' : 'Admin';

  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <section className="auth-card">
          <p className="eyebrow">Secure JWT Auth Demo</p>
          <h1>Login to your session</h1>
          <p className="helper-text">
            Secure stateless auth demo using a signed JWT token in a session store.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              Role
              <select value={role} onChange={(event) => {
                const nextRole = event.target.value;
                setRole(nextRole);
                setEmail(nextRole === 'creator' ? 'creator@jwt.local' : 'admin@jwt.local');
                setPassword(nextRole === 'creator' ? 'Creator@123' : 'Admin@123');
              }}>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
              </select>
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={role === 'creator' ? 'creator@jwt.local' : 'admin@jwt.local'}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={role === 'creator' ? 'Creator@123' : 'Admin@123'}
                required
              />
            </label>

            <button type="submit" className="primary-button">
              Login
            </button>
          </form>

          <div className="status-box">
            <strong>Demo credentials:</strong>
            <br />
            Admin: admin@jwt.local / Admin@123
            <br />
            Creator: creator@jwt.local / Creator@123
          </div>

          {feedback && <p className="feedback-message">{feedback}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar currentRoute={route} onNavigate={setRoute} user={user} onLogout={logout} />
      <main className="page-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">Protected Route</p>
            <h2>Welcome back, {user?.name || 'User'}</h2>
            <p className="helper-text">Role: {roleLabel}</p>
          </div>
          <span className="token-pill">JWT session active</span>
        </div>
        <RoadRoute route={route} role={user?.role || role} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
