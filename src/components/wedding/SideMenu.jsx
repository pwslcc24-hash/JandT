import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { wedding } from "@/config/wedding";
import { useSiteContent } from "@/cms/hooks/useSiteContent";
import { WeddingIcon } from "./icons";

const itemMotion = {
  hidden: { opacity: 0, x: -32, y: -24 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function SideMenu({ open, onClose, className = "", fixed = false }) {
  const navigate = useNavigate();
  const { couple, nav } = useSiteContent();

  const goTo = (slug) => {
    onClose();
    navigate(`/${slug}`);
  };

  const goHome = () => {
    onClose();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className={`menu-backdrop${fixed ? " menu-backdrop--fixed" : ""}`}
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            className={`menu-card open ${className}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
          >
            <button
              type="button"
              className="menu-close"
              aria-label="Close menu"
              onClick={onClose}
            >
              <WeddingIcon name="close" className="menu-close-icon" />
            </button>

            <motion.button
              type="button"
              className="menu-name"
              variants={itemMotion}
              initial="hidden"
              animate="visible"
              custom={0}
              onClick={goHome}
            >
              {couple.lastName}
            </motion.button>

            <nav className="menu-nav">
              {nav.map((item, i) => (
                <motion.button
                  key={item.slug}
                  type="button"
                  className="menu-item"
                  variants={itemMotion}
                  initial="hidden"
                  animate="visible"
                  custom={i + 1}
                  onClick={() => goTo(item.slug)}
                >
                  <WeddingIcon name={item.icon} className="menu-item-icon" />
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
