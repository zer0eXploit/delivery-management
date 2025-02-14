import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load pages
const HomePage = lazy(() => import("./pages/Home.page"));
const LoginPage = lazy(() => import("./pages/Login.page"));
const RegisterPage = lazy(() => import("./pages/Register.page"));
const NotFoundPage = lazy(() => import("./pages/NotFound.page"));

// Components
import { AuthGuard } from "./components/auth";
import { LoadingSpinner } from "./components/common";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard requireAuth>
        <Suspense fallback={<LoadingSpinner size="large" />}>
          <HomePage />
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: "/auth/login",
    element: (
      <AuthGuard>
        <Suspense fallback={<LoadingSpinner size="large" />}>
          <LoginPage />
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <AuthGuard>
        <Suspense fallback={<LoadingSpinner size="large" />}>
          <RegisterPage />
        </Suspense>
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner size="large" />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
