import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import MobileLayout from "../layouts/MobileLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home";
import Templates from "../pages/Templates";
import Plans from "../pages/Plans";

import MobileHome from "../pages/MobileHome";
import MobileTemplates from "../pages/MobileTemplates";
import MobileRewards from "../pages/MobileRewards";
import MobileProfile from "../pages/MobileProfile";
import MobileMyPages from "../pages/MobileMyPages";
import MobileWallet from "../pages/MobileWallet";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import SubscribePlan from "../pages/SubscribePlan";
import MyPages from "../pages/MyPages";
import Wallet from "../pages/Wallet";
import Rewards from "../pages/Rewards";
import Checkout from "../pages/Checkout";
import PageEditor from "../pages/PageEditor";
import ZipEditor from "../pages/ZipEditor";
import TemplatePreview from "../pages/TemplatePreview";
import PublicPage from "../pages/PublicPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminTemplates from "../pages/admin/AdminTemplates";
import AdminCreateTemplate from "../pages/admin/AdminCreateTemplate";
import AdminPlans from "../pages/admin/AdminPlans";
import AdminCreatePlan from "../pages/admin/AdminCreatePlan";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminPendingPayments from "../pages/admin/AdminPendingPayments";
import AdminApprovedPayments from "../pages/admin/AdminApprovedPayments";
import AdminRejectedPayments from "../pages/admin/AdminRejectedPayments";
import AdminExpiredPayments from "../pages/admin/AdminExpiredPayments";
import AdminRewards from "../pages/admin/AdminRewards";
import AdminTemplateCategories from "../pages/admin/AdminTemplateCategories";
import AdminLinkOptions from "../pages/admin/AdminLinkOptions";
import AdminQrStyles from "../pages/admin/AdminQrStyles";
import AdminPublishedPages from "../pages/admin/AdminPublishedPages";
import AdminSubscriptions from "../pages/admin/AdminSubscriptions";
import AdminUserPages from "../pages/admin/AdminUserPages";
import AdminPurchasedTemplates from "../pages/admin/AdminPurchasedTemplates";
import { useAuth } from "../hooks/useAuth";

function useIsMobile() {
  return window.innerWidth <= 768;
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function AppRoutes() {
  const isMobile = useIsMobile();

  return (
    <Routes>
      <Route element={isMobile ? <MobileLayout /> : <MainLayout />}>
        <Route path="/" element={isMobile ? <MobileHome /> : <Home />} />
        <Route
          path="/templates"
          element={isMobile ? <MobileTemplates /> : <Templates />}
        />
        <Route path="/plans" element={<Plans />} />

        <Route
          path="/subscribe-plan/:planId"
          element={
            <PrivateRoute>
              <SubscribePlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/editor/:pageId"
          element={
            <PrivateRoute>
              <PageEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-pages"
          element={
            <PrivateRoute>
              {isMobile ? <MobileMyPages /> : <MyPages />}
            </PrivateRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <PrivateRoute>
              {isMobile ? <MobileWallet /> : <Wallet />}
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <PrivateRoute>
              {isMobile ? <MobileRewards /> : <Rewards />}
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MobileProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/zip-editor"
          element={
            <PrivateRoute>
              <ZipEditor />
            </PrivateRoute>
          }
        />
        <Route path="/template-preview/:id" element={<TemplatePreview />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="templates/create" element={<AdminCreateTemplate />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="plans/create" element={<AdminCreatePlan />} />
        <Route path="payments/pending" element={<AdminPendingPayments />} />
        <Route path="payments/approved" element={<AdminApprovedPayments />} />
        <Route path="payments/rejected" element={<AdminRejectedPayments />} />
        <Route path="payments/expired" element={<AdminExpiredPayments />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="rewards" element={<AdminRewards />} />
        <Route
          path="template-categories"
          element={<AdminTemplateCategories />}
        />
        <Route path="link-options" element={<AdminLinkOptions />} />
        <Route path="qr-styles" element={<AdminQrStyles />} />
        <Route path="published-pages" element={<AdminPublishedPages />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="user-pages" element={<AdminUserPages />} />
        <Route
          path="purchased-templates"
          element={<AdminPurchasedTemplates />}
        />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/:slug" element={<PublicPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
