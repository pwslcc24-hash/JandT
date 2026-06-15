export type UserRole = "admin" | "viewer";
export type DeviceMode = "desktop" | "tablet" | "mobile";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type BlockType = "text" | "rich_text" | "image" | "json";

export interface ElementStyles {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  textAlign?: "left" | "center" | "right";
  width?: string;
  height?: string;
  zIndex?: string;
}

export interface ContentBlock {
  id: string;
  blockKey: string;
  blockType: BlockType;
  value: Record<string, unknown>;
  styles: ElementStyles;
  stylesTablet: ElementStyles;
  stylesMobile: ElementStyles;
  sortOrder: number;
}

export interface SiteSection {
  id: string;
  sectionKey: string;
  sectionType: string;
  sortOrder: number;
  styles: ElementStyles;
  stylesTablet: ElementStyles;
  stylesMobile: ElementStyles;
  blocks: ContentBlock[];
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  sections: SiteSection[];
}

export interface SiteDocument {
  clientId: string;
  clientSlug: string;
  clientName: string;
  pages: SitePage[];
  settings: Record<string, unknown>;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  publicUrl: string;
  storagePath: string;
  fileName: string;
  altText: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

export interface EditorSelection {
  blockId: string;
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  sectionId?: string;
  targetType?: "block" | "section";
  label?: string;
  meta?: Record<string, unknown>;
}
