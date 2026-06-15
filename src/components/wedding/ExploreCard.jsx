import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { WeddingIcon } from "./icons";

export default function ExploreCard({ item, index }) {
  return (
    <motion.div
      className="card-wrap"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.09,
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link to={`/${item.slug}`} className="card">
        <div className="card-icon">
          <WeddingIcon name={item.icon} className="card-icon-svg" />
        </div>
        <div className="card-overlay" />
        <div className="card-bottom">
          <div className="card-link">
            <span className="card-link-label">{item.label}</span>
            <span className="card-link-underline" aria-hidden="true">
              <span className="card-link-line" />
            </span>
          </div>
          <span className="card-link-arrow" aria-hidden="true">
            <WeddingIcon name="forward" className="card-arrow-icon" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
