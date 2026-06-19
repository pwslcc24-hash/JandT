import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideMenu from "./SideMenu";
import { WeddingIcon } from "./icons";

export default function PageChrome({ children, backTo = "/#explore" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="section-page">
      <header className="section-header">
        <button
          type="button"
          className="section-back"
          aria-label="Back"
          onClick={() => navigate(backTo)}
        >
          <WeddingIcon name="back" className="section-back-icon" />
        </button>

        <button
          type="button"
          className="section-menu-toggle"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <WeddingIcon name="menu" className="section-menu-icon" />
        </button>
      </header>

      <div className="section-page-inner">{children}</div>

      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        className="menu-card--page"
        fixed
      />
    </div>
  );
}
