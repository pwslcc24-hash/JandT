import { useEditor } from "@/cms/context/EditorContext";

export default function AdminSettings() {
  const { site } = useEditor();

  return (
    <div className="admin-page">
      <h1>Site Settings</h1>
      <pre className="admin-code">{JSON.stringify(site?.settings ?? {}, null, 2)}</pre>
      <p className="admin-muted">Edit site-wide settings in Supabase site_settings table.</p>
    </div>
  );
}
