import { useAuth } from '../features/authSlice';
import { createSecureRequest } from '../api/axios';

export default function Compose() {
  const { token } = useAuth();
  const request = createSecureRequest(token, '/secure/compose');

  return (
    <section className="page-card">
      <h3>Compose</h3>
      <p>
        This page shows the JWT request layer with a protected Authorization header.
      </p>
      <p>
        <strong>Protected request:</strong> {request.endpoint} | {request.headers.Authorization}
      </p>
    </section>
  );
}
