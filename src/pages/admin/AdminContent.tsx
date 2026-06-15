import { useEditor } from "@/cms/context/EditorContext";

export default function AdminContent() {
  const { site } = useEditor();

  return (
    <div className="admin-page">
      <h1>Content Manager</h1>
      <p className="admin-muted">All editable blocks across your site.</p>
      {site?.pages.map((page) => (
        <div key={page.id} className="admin-content-page">
          <h2>{page.title}</h2>
          {page.sections.map((sec) => (
            <div key={sec.id} className="admin-content-section">
              <h3>{sec.sectionKey}</h3>
              <ul>
                {sec.blocks.map((b) => (
                  <li key={b.id}>
                    <strong>{b.blockKey}</strong> ({b.blockType})
                    {b.blockType === "text" && `: "${String(b.value.text ?? "")}"`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
