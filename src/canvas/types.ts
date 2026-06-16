export type CanvasElementType = "image" | "text" | "button";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  src?: string;
  label?: string;
  href?: string;
  backgroundColor?: string;
  borderRadius?: number;
  buttonFontSize?: number;
  buttonColor?: string;
}

export type CanvasTool = "select" | "text" | "image" | "gallery" | "button";

export interface CanvasState {
  elements: CanvasElement[];
  canvasHeight: number;
}

export const CANVAS_WIDTH = 1200;
export const GRID_SIZE = 8;
export const DEFAULT_IMAGE = { width: 280, height: 200 };
export const DEFAULT_TEXT = { width: 240, height: 80 };
export const DEFAULT_BUTTON = { width: 160, height: 44 };
