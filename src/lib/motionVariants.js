// Shared motion variants — matches the menu card spring physics
// Menu: spring damping:26 stiffness:280, items: ease [0.16,1,0.3,1]

export const SPRING = { type: "spring", damping: 26, stiffness: 280 };
export const EASE = [0.16, 1, 0.3, 1];

// Parent container — staggers children top-to-bottom (waterfall)
export const pageContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Generic child: slides up + fades in
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Heading / title: slides down from above
export const slideDown = {
  hidden: { opacity: 0, y: -22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Horizontal rule / horizontal line: slides in from right
export const slideInRight = {
  hidden: { opacity: 0, x: 48, scaleX: 0.6 },
  visible: {
    opacity: 1,
    x: 0,
    scaleX: 1,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};

// Vertical line: grows downward
export const slideDownLine = {
  hidden: { opacity: 0, scaleY: 0, originY: 0 },
  visible: {
    opacity: 1,
    scaleY: 1,
    transition: { type: "spring", damping: 26, stiffness: 280 },
  },
};