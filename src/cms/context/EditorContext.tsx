import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  DeviceMode,
  EditorSelection,
  ElementStyles,
  SaveStatus,
  PublishStatus,
  SiteDocument,
} from "../types";
import { loadSiteDocument, saveLocalDraft, publishSiteDocument } from "../api/content";
import { cloneSiteDocument, touchSiteDocument } from "../utils/immutable";
import { applyAiOperations } from "../ai/applyOperations";
import type { AiOperation } from "../ai/types";
import {
  devSignInAsAdmin,
  devSignOut,
  getSessionUser,
  isSupabaseConfigured,
  signIn,
  signOut,
  unlockWithPin as authUnlockWithPin,
  type CmsUser,
} from "../api/auth";

const MAX_HISTORY = 50;
const SAVE_DEBOUNCE_MS = 800;

interface EditorContextValue {
  user: CmsUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (d: DeviceMode) => void;
  site: SiteDocument | null;
  saveStatus: SaveStatus;
  publishStatus: PublishStatus;
  publishError: string;
  publishSite: () => Promise<void>;
  selection: EditorSelection | null;
  setSelection: (s: EditorSelection | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  devLogin: () => void;
  unlockWithPin: (pin: string) => boolean;
  updateBlockText: (
    pageSlug: string,
    sectionKey: string,
    blockKey: string,
    text: string
  ) => void;
  updateBlockValue: (
    pageSlug: string,
    sectionKey: string,
    blockKey: string,
    patch: Record<string, unknown>
  ) => void;
  updateBlockStyles: (
    pageSlug: string,
    sectionKey: string,
    blockKey: string,
    styles: Partial<ElementStyles>
  ) => void;
  reorderSections: (pageSlug: string, sectionIds: string[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getBlockStyles: (
    pageSlug: string,
    sectionKey: string,
    blockKey: string
  ) => ElementStyles;
  aiPanelOpen: boolean;
  setAiPanelOpen: (v: boolean) => void;
  aiPickMode: boolean;
  setAiPickMode: (v: boolean) => void;
  selectTarget: (s: EditorSelection) => void;
  applyAiEdits: (operations: AiOperation[]) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const noop = () => {};
const noopAsync = async () => {};

/** Safe fallback when Base44 preview scans components outside the full app tree */
const READONLY_EDITOR: EditorContextValue = {
  user: null,
  isAdmin: false,
  isLoading: false,
  editMode: false,
  setEditMode: noop,
  deviceMode: "desktop",
  setDeviceMode: noop,
  site: null,
  saveStatus: "idle",
  publishStatus: "idle",
  publishError: "",
  publishSite: noopAsync,
  selection: null,
  setSelection: noop,
  login: noopAsync,
  logout: noopAsync,
  devLogin: noop,
  unlockWithPin: () => false,
  updateBlockText: noop,
  updateBlockValue: noop,
  updateBlockStyles: noop,
  reorderSections: noop,
  undo: noop,
  redo: noop,
  canUndo: false,
  canRedo: false,
  getBlockStyles: () => ({}),
  aiPanelOpen: false,
  setAiPanelOpen: noop,
  aiPickMode: false,
  setAiPickMode: noop,
  selectTarget: noop,
  applyAiEdits: noop,
};

export function EditorProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [site, setSite] = useState<SiteDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle");
  const [publishError, setPublishError] = useState("");
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  const [aiPanelOpen, setAiPanelOpenState] = useState(false);
  const [aiPickMode, setAiPickMode] = useState(false);

  const setAiPanelOpen = useCallback((open: boolean) => {
    setAiPanelOpenState(open);
    setAiPickMode(open);
  }, []);

  const selectTarget = useCallback((target: EditorSelection) => {
    setSelection(target);
    setAiPanelOpenState(true);
    setAiPickMode(true);
  }, []);

  const historyRef = useRef<SiteDocument[]>([]);
  const futureRef = useRef<SiteDocument[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([getSessionUser(), loadSiteDocument()]).then(async ([u, doc]) => {
      let initial = cloneSiteDocument(doc);
      if (u?.role === "admin") {
        const draftDoc = await loadSiteDocument({ preferDraft: true });
        const publishedTs = Date.parse(doc.updatedAt || "0");
        const draftTs = Date.parse(draftDoc.updatedAt || "0");
        if (draftTs > publishedTs) {
          initial = cloneSiteDocument(draftDoc);
        }
      }
      setUser(u);
      setSite(initial);
      historyRef.current = [initial];
      setIsLoading(false);
    });
  }, []);

  const pushHistory = useCallback((doc: SiteDocument) => {
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), doc];
    futureRef.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  const commitSite = useCallback(
    (updater: (draft: SiteDocument) => void) => {
      setSite((prev) => {
        if (!prev) return prev;
        const draft = cloneSiteDocument(prev);
        updater(draft);
        const next = touchSiteDocument(draft);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  useEffect(() => {
    if (!site) return;
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveLocalDraft(site);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(saveTimerRef.current);
  }, [site]);

  const findBlock = (
    doc: SiteDocument,
    pageSlug: string,
    sectionKey: string,
    blockKey: string
  ) => {
    const page = doc.pages.find((p) => p.slug === pageSlug);
    const section = page?.sections.find((s) => s.sectionKey === sectionKey);
    return section?.blocks.find((b) => b.blockKey === blockKey);
  };

  const styleKey = (d: DeviceMode) =>
    d === "tablet" ? "stylesTablet" : d === "mobile" ? "stylesMobile" : "styles";

  const updateBlockText = useCallback(
    (pageSlug: string, sectionKey: string, blockKey: string, text: string) => {
      commitSite((draft) => {
        const block = findBlock(draft, pageSlug, sectionKey, blockKey);
        if (block) block.value.text = text;
      });
    },
    [commitSite]
  );

  const updateBlockValue = useCallback(
    (
      pageSlug: string,
      sectionKey: string,
      blockKey: string,
      patch: Record<string, unknown>
    ) => {
      commitSite((draft) => {
        let block = findBlock(draft, pageSlug, sectionKey, blockKey);
        if (!block) {
          // Auto-create the page/section/block if missing (e.g. story media slots)
          let page = draft.pages.find((p) => p.slug === pageSlug);
          if (!page) {
            page = { id: `page-${pageSlug}`, slug: pageSlug, title: pageSlug, sortOrder: 99, sections: [] };
            draft.pages.push(page);
          }
          let section = page.sections.find((s) => s.sectionKey === sectionKey);
          if (!section) {
            section = { id: `sec-${pageSlug}-${sectionKey}`, sectionKey, sectionType: "story-media", sortOrder: 0, styles: {}, stylesTablet: {}, stylesMobile: {}, blocks: [] };
            page.sections.push(section);
          }
          block = { id: `blk-${blockKey}`, blockKey, blockType: "image", value: {}, styles: {}, stylesTablet: {}, stylesMobile: {}, sortOrder: 0 };
          section.blocks.push(block);
        }
        block.value = { ...block.value, ...patch };
      });
    },
    [commitSite]
  );

  const updateBlockStyles = useCallback(
    (
      pageSlug: string,
      sectionKey: string,
      blockKey: string,
      styles: Partial<ElementStyles>
    ) => {
      commitSite((draft) => {
        const block = findBlock(draft, pageSlug, sectionKey, blockKey);
        if (!block) return;
        const key = styleKey(deviceMode);
        block[key] = { ...block[key], ...styles };
      });
    },
    [commitSite, deviceMode]
  );

  const reorderSections = useCallback(
    (pageSlug: string, sectionIds: string[]) => {
      commitSite((draft) => {
        const page = draft.pages.find((p) => p.slug === pageSlug);
        if (!page) return;
        sectionIds.forEach((id, i) => {
          const sec = page.sections.find((s) => s.id === id);
          if (sec) sec.sortOrder = i;
        });
        page.sections = [...page.sections].sort((a, b) => a.sortOrder - b.sortOrder);
      });
    },
    [commitSite]
  );

  const undo = useCallback(() => {
    if (historyRef.current.length < 2) return;
    const current = historyRef.current.pop()!;
    futureRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    setSite(cloneSiteDocument(prev));
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    setSite(cloneSiteDocument(next));
    setHistoryTick((t) => t + 1);
  }, []);

  const getBlockStyles = useCallback(
    (pageSlug: string, sectionKey: string, blockKey: string): ElementStyles => {
      if (!site) return {};
      const block = findBlock(site, pageSlug, sectionKey, blockKey);
      if (!block) return {};
      const key = styleKey(deviceMode);
      return (block[key] as ElementStyles) ?? {};
    },
    [site, deviceMode]
  );

  const login = async (email: string, password: string) => {
    const { profile } = await signIn(email, password);
    if (profile) setUser(profile);
  };

  const logout = async () => {
    if (isSupabaseConfigured) await signOut();
    else devSignOut();
    setUser(null);
    setEditMode(false);
    setSelection(null);
  };

  const devLogin = () => setUser(devSignInAsAdmin());

  const unlockWithPin = (pin: string) => {
    const user = authUnlockWithPin(pin);
    if (!user) return false;
    setUser(user);
    return true;
  };

  const applyAiEdits = useCallback(
    (operations: AiOperation[]) => {
      setSite((prev) => {
        if (!prev) return prev;
        const next = touchSiteDocument(applyAiOperations(cloneSiteDocument(prev), operations));
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const publishSite = useCallback(async () => {
    if (!site) return;
    setPublishStatus("publishing");
    setPublishError("");
    try {
      const saved = await publishSiteDocument(site);
      setSite(cloneSiteDocument(saved));
      historyRef.current = [cloneSiteDocument(saved)];
      futureRef.current = [];
      setHistoryTick((t) => t + 1);
      setPublishStatus("published");
      setTimeout(() => setPublishStatus("idle"), 3000);
    } catch (err) {
      setPublishStatus("error");
      setPublishError(err instanceof Error ? err.message : "Failed to save live");
    }
  }, [site]);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      isLoading,
      editMode,
      setEditMode,
      deviceMode,
      setDeviceMode,
      site,
      saveStatus,
      publishStatus,
      publishError,
      publishSite,
      selection,
      setSelection,
      login,
      logout,
      devLogin,
      unlockWithPin,
      updateBlockText,
      updateBlockValue,
      updateBlockStyles,
      reorderSections,
      undo,
      redo,
      canUndo: historyRef.current.length > 1,
      canRedo: futureRef.current.length > 0,
      getBlockStyles,
      aiPanelOpen,
      setAiPanelOpen,
      aiPickMode,
      setAiPickMode,
      selectTarget,
      applyAiEdits,
    }),
    [
      user,
      isLoading,
      editMode,
      deviceMode,
      site,
      saveStatus,
      publishStatus,
      publishError,
      selection,
      aiPanelOpen,
      aiPickMode,
      updateBlockText,
      updateBlockValue,
      updateBlockStyles,
      reorderSections,
      undo,
      redo,
      getBlockStyles,
      setAiPanelOpen,
      selectTarget,
      publishSite,
      applyAiEdits,
      historyTick,
    ]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  return ctx ?? READONLY_EDITOR;
}