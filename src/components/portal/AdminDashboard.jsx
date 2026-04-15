// Re-exports the existing Admin page logic, just passing adminAuth as prop
// We use the existing Admin page directly since it already handles everything
import Admin from '../../pages/Admin';
export default function AdminDashboard({ adminAuth }) {
  return <Admin injectedAuth={adminAuth} />;
}