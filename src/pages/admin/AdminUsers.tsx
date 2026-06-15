export default function AdminUsers() {
  return (
    <div className="admin-page">
      <h1>Users</h1>
      <p className="admin-muted">
        Manage Admin and Viewer roles in Supabase Auth + profiles table.
        Admins can access Edit Mode; Viewers see the public site only.
      </p>
      <div className="admin-placeholder">
        Connect Supabase to manage users. Assign roles via the profiles table.
      </div>
    </div>
  );
}
