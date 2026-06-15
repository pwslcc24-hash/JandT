import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { EditorProvider } from "@/cms/context/EditorContext";
import EditorShell from "@/components/editor/EditorShell";
import WeddingLanding from "@/pages/WeddingLanding";
import WeddingSection from "@/pages/WeddingSection";
import WeddingGallery from "@/pages/WeddingGallery";
import CmsLoginPage from "@/pages/admin/CmsLoginPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPages from "@/pages/admin/AdminPages";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminContent from "@/pages/admin/AdminContent";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

function PublicLayout() {
  return (
    <EditorShell>
      <Outlet />
    </EditorShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <EditorProvider>
        <Routes>
          <Route path="/admin/login" element={<CmsLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<WeddingLanding />} />
            <Route path="/photos/:album" element={<WeddingGallery />} />
            <Route path="/:slug" element={<WeddingSection />} />
          </Route>
        </Routes>
      </EditorProvider>
    </BrowserRouter>
  );
}

export default App;
