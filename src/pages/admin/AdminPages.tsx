import { useEditor } from "@/cms/context/EditorContext";
import { Link } from "react-router-dom";

export default function AdminPages() {
  const { site } = useEditor();

  return (
    <div className="admin-page">
      <h1>Pages</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Sections</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {site?.pages.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td><code>/{p.slug === "home" ? "" : p.slug}</code></td>
              <td>{p.sections.length}</td>
              <td>
                <Link to={p.slug === "home" ? "/" : `/${p.slug}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
