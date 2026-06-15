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
import { produce } from "immer";
import type {
  DeviceMode,
  EditorSelection,
  ElementStyles,
  SaveStatus,
  SiteDocument,
} from "../types";
import { loadSiteDocument, saveSiteDocument } from "../api/content";
import {
  devSignInAsAdmin,
  devSignOut,
  getSessionUser,
  isSupabaseConfigured,
  signIn,
  signOut,
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
  selection: EditorSelection | null;
  setSelection: (s: EditorSelection | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  devLogin: () => void;
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
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CmsUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [site, setSite] = useState<SiteDocument | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  const historyRef = useRef<SiteDocument[]>([]);
  const futureRef = useRef<SiteDocument[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([getSessionUser(), loadSiteDocument()]).then(([u, doc]) => {
      setUser(u);
      setSite(doc);
      historyRef.current = [doc];
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
        const next = produce(prev, updater);
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
        await saveSiteDocument(site);
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
        const block = findBlock(draft, pageSlug, sectionKey, blockKey);
        if (block) Object.assign(block.value, patch);
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
        Object.assign(block[key], styles);
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
        page.sections.sort((a, b) => a.sortOrder - b.sortOrder);
      });
    },
    [commitSite]
  );

  const undo = useCallback(() => {
    if (historyRef.current.length < 2) return;
    const current = historyRef.current.pop()!;
    futureRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    setSite(prev);
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    setSite(next);
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
  };

  const devLogin = () => setUser(devSignInAsAdmin());

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
      selection,
      setSelection,
      login,
      logout,
      devLogin,
      updateBlockText,
      updateBlockValue,
      updateBlockStyles,
      reorderSections,
      undo,
      redo,
      canUndo: historyRef.current.length > 1,
      canRedo: futureRef.current.length > 0,
      getBlockStyles,
    }),
    [
      user,
      isLoading,
      editMode,
      deviceMode,
      site,
      saveStatus,
      selection,
      updateBlockText,
      updateBlockValue,
      updateBlockStyles,
      reorderSections,
      undo,
      redo,
      getBlockStyles,
      historyTick,
    ]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
