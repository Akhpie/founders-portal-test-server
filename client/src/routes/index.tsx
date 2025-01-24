import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import UserDetailsForm from "../pages/UserDetailsForm";
import CompanyDetailsForm from "../pages/CompanyDetailsForm";
import Portal from "../pages/Portal";
import PreSeed from "../pages/nav-tabs/PreSeed";
import Seed from "../pages/nav-tabs/Seed";
import Incubators from "../pages/nav-tabs/Incubators";
import PortalHome from "../pages/nav-tabs/PortalHome";
import Checklist from "../pages/Checklist";
import Settings from "../pages/Settings";
import Profile from "../pages/settings/Profile";
import Security from "../pages/settings/Security";
import Notifications from "../pages/settings/Notifications";
import VerifyEmail from "../pages/VerifyEmail";
import ResetPasswordPage from "../pages/PasswordReset";
import SubscriptionPage from "../pages/SubscriptionPage";
import PreSeedDetail from "../pages/detail-page/PreSeedDetail";
import AdminLogin from "../ADMIN/Admin-Auth/AdminLogin";
import AdminLayout from "../ADMIN/Admin-Portal/AdminLayout";
import AdminDashboard from "../ADMIN/Admin-tabs/AdminDashboard";
import AdminUserSettings from "../ADMIN/Admin-tabs/AdminUserSettings";
import SupportPage from "../pages/settings/SupportPage";
import FaqManagement from "../ADMIN/Admin-tabs/Feature-Management/FaqManagement";
import ChecklistManagement from "../ADMIN/Admin-tabs/Feature-Management/ChecklistManagement";
import PreSeedManagement from "../ADMIN/Admin-tabs/investor-management/PreSeedManagement";
import SeedManagement from "../ADMIN/Admin-tabs/investor-management/SeedManagement";
import IncubatorsManagement from "../ADMIN/Admin-tabs/investor-management/IncubatorsManagement";
import IncubatorDetails from "../pages/detail-page/IncubatorDetail";
import UserAnalytics from "../ADMIN/Admin-tabs/Analytics/UserAnalytics";
import ResourceManagement from "../ADMIN/Admin-tabs/Resource-management/ResourceManagement";
import NotificationManagement from "../ADMIN/Admin-tabs/Notifications/NotificationManagement";
import AdminManagement from "../ADMIN/Admin-tabs/Admin-management/AdminManagement";
import AngelInvestors from "../pages/nav-tabs/AngelInvestors";
import StartupYTInfluencers from "../pages/nav-tabs/StartupYTInfluencers";
import InfluencerManagement from "../ADMIN/Admin-tabs/influencer-management/InfluencerManagement";
import StartupInfluencers from "../pages/nav-tabs/StartupInfluencers";
import StartupInfluencerManagement from "../ADMIN/Admin-tabs/influencer-management/StartupInfluencerManagement";
import AngelManagement from "../ADMIN/Admin-tabs/angel-management/AngelManagement";
import AngelDetail from "../pages/detail-page/AngelDetail";
import SeedDetail from "../pages/detail-page/SeedDetail";
import ProtectedAdminRoute from "../components/Admin-security/AdminRouteProtection";
import AdminPasswordPage from "../components/Admin-security/AdminPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/subscription-plans",
    element: <SubscriptionPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/user-details",
    element: <UserDetailsForm />,
  },
  {
    path: "/company-details",
    element: <CompanyDetailsForm />,
  },
  {
    path: "/admin-password",
    element: <AdminPasswordPage />,
  },
  {
    path: "/portal",
    element: <Portal />,
    children: [
      {
        path: "",
        element: <PortalHome />,
      },
      {
        path: "pre-seed",
        element: <PreSeed />,
      },
      {
        path: "angel-investors",
        element: <AngelInvestors />,
      },
      {
        path: "yt-startup-influencers",
        element: <StartupYTInfluencers />,
      },
      {
        path: "startup-influencers",
        element: <StartupInfluencers />,
      },
      {
        path: "pre-seed/detail/:id",
        element: <PreSeedDetail />,
      },
      {
        path: "seed",
        element: <Seed />,
      },
      {
        path: "incubators",
        element: <Incubators />,
      },
      {
        path: "angel-investors/angels-detail/:id",
        element: <AngelDetail />,
      },
      {
        path: "preseed-investors/preseed-detail/:id",
        element: <PreSeedDetail />,
      },
      {
        path: "seed-investors/seed-detail/:id",
        element: <SeedDetail />,
      },
      {
        path: "incubators/incubators-detail/:id",
        element: <IncubatorDetails />,
      },
      {
        path: "checklist",
        element: <Checklist />,
      },
      {
        path: "support",
        element: <SupportPage />,
      },
      {
        path: "settings",
        element: <Settings />,
        children: [
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "security",
            element: <Security />,
          },
          {
            path: "notifications",
            element: <Notifications />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminLogin />
      </ProtectedAdminRoute>
    ),
  },
  {
    path: "/adminPortal",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "user-settings",
        element: <AdminUserSettings />,
      },
      {
        path: "admin-settings",
        element: <AdminManagement />,
      },
      {
        path: "analytics/user-analytics",
        element: <UserAnalytics />,
      },
      {
        path: "features/faqs",
        element: <FaqManagement />,
      },
      {
        path: "features/checklist",
        element: <ChecklistManagement />,
      },
      {
        path: "investors/pre-seed",
        element: <PreSeedManagement />,
      },
      {
        path: "investors/seed",
        element: <SeedManagement />,
      },
      {
        path: "investors/incubators",
        element: <IncubatorsManagement />,
      },
      {
        path: "investors/influencers",
        element: <InfluencerManagement />,
      },
      {
        path: "investors/startup-influencers",
        element: <StartupInfluencerManagement />,
      },
      {
        path: "investors/angel-investors",
        element: <AngelManagement />,
      },
      {
        path: "resource-management/resources",
        element: <ResourceManagement />,
      },
      {
        path: "notification-management/notifications",
        element: <NotificationManagement />,
      },
    ],
  },
]);
