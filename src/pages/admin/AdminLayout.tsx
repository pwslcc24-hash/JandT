import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useEditor } from "@/cms/context/EditorContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/media", label: "Media Library" },
  { to: "/admin/content", label: "Content Manager" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/settings", label: "Site Settings" },
  { to: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout() {
  const { isAdmin, isLoading, logout } = useEditor();

  if (isLoading) return <div className="admin-loading">Loading…</div>;
  if (!isAdmin) return <Navigate to="/studio" replace />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Holdsworth CMS</div>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-nav-link">
            View Site
          </NavLink>
          <button type="button" className="admin-logout" onClick={() => logout()}>
            Log Out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
