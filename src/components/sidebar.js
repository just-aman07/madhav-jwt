export default function Sidebar({ currentRoute, onNavigate, user, onLogout }) {
  const routes = [
    { key: 'compose', label: 'Compose' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'calender', label: 'Calendar' },
  ];

  return (
    <aside className="sidebar">
      <h3>JWT Session</h3>
      <p>{user?.email || 'Authenticated user'}</p>
      <p>Role: {user?.role || 'Unknown'}</p>

      <nav className="sidebar-nav">
        {routes.map((route) => {
          const isAdminOnly = route.key === 'analytics' || route.key === 'calender';
          const isDisabled = isAdminOnly && user?.role !== 'admin';

          return (
            <button
              key={route.key}
              type="button"
              className={`sidebar-button ${currentRoute === route.key ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => onNavigate(route.key)}
              disabled={isDisabled}
            >
              {route.label}
            </button>
          );
        })}
      </nav>

      <button type="button" className="secondary-button" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}
