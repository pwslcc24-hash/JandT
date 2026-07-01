// Shared motion variants
// Rule: everything waterfalls DOWN and to the RIGHT.
// Menu spring physics: damping:26 stiffness:280

export const SPRING = { type: "spring", damping: 26, stiffness: 280 };
export const EASE = [0.16, 1, 0.3, 1];

// Parent container — staggers children top-to-bottom (waterfall)
export const pageContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Titles / headings: drop straight down
export const slideDown = {
  hidden: { opacity: 0, y: -28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Body text / generic content: drops down and drifts right
export const fadeUp = {
  hidden: { opacity: 0, y: -20, x: -16 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Boxes / cards / photos: drop down from above
export const dropIn = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Horizontal lines: sweep in from left to right
export const slideInRight = {
  hidden: { opacity: 0, scaleX: 0, originX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Vertical lines: grow downward from top
export const slideDownLine = {
  hidden: { opacity: 0, scaleY: 0, originY: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};