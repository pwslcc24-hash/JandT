import { Link } from "react-router-dom";
import { useEditor } from "@/cms/context/EditorContext";

export default function AdminDashboard() {
  const { site, setEditMode } = useEditor();

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <p className="admin-muted">
        Manage your wedding site visually — no code required.
      </p>

      <div className="admin-cards">
        <div className="admin-card">
          <h2>Quick Edit</h2>
          <p>Jump into Edit Mode on the live site.</p>
          <Link
            to="/"
            className="admin-btn"
            onClick={() => setEditMode(true)}
          >
            Open Edit Mode
          </Link>
        </div>
        <div className="admin-card">
          <h2>Pages</h2>
          <p>{site?.pages.length ?? 0} pages configured</p>
          <Link to="/admin/pages" className="admin-btn admin-btn--secondary">
            Manage Pages
          </Link>
        </div>
        <div className="admin-card">
          <h2>Last Saved</h2>
          <p>{site?.updatedAt ? new Date(site.updatedAt).toLocaleString() : "—"}</p>
        </div>
      </div>
    </div>
  );
}
