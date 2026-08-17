import Compose from '../pages/compose';
import Analytics from '../pages/analytics';
import Calender from '../pages/calender';

export default function RoadRoute({ route, role }) {
  if ((route === 'analytics' || route === 'calender') && role !== 'admin') {
    return (
      <section className="page-card">
        <h3>Access denied</h3>
        <p>This page is only available to users with the admin role.</p>
      </section>
    );
  }

  if (route === 'analytics') {
    return <Analytics />;
  }

  if (route === 'calender') {
    return <Calender />;
  }

  return <Compose />;
}
