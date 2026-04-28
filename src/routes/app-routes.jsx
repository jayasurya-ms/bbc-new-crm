import Login from "@/app/auth/login";
import NotFound from "@/app/errors/not-found";
import Settings from "@/app/setting/setting";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import ForgotPassword from "@/components/forgot-password/forgot-password";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import Home from "@/app/dashboard/Home";
import Profile from "@/app/profile/Profile";
import AboutUs from "@/app/about-us/AboutUs";
import MissionVision from "@/app/mission-vision/MissionVision";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Profile />
              </Suspense>
            }
          />
          <Route
            path="/about-us"
            element={
              <Suspense fallback={<LoadingBar />}>
                <AboutUs />
              </Suspense>
            }
          />
          <Route
            path="/mission-and-vission"
            element={
              <Suspense fallback={<LoadingBar />}>
                <MissionVision />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
