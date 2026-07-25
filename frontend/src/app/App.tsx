import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ChangePasswordPage } from '@pages/change-password';
import { ItemsPage } from '@pages/items';
import { LoginPage } from '@pages/login';
import { MyPage } from '@pages/me';
import { RealtimePage } from '@pages/realtime';
import { RegisterPage } from '@pages/register';

import { RootLayout } from './layouts/RootLayout';
import { GuestRoute } from './router/GuestRoute';
import { ProtectedRoute } from './router/ProtectedRoute';

const UiShowcasePage = import.meta.env.DEV
  ? lazy(() =>
      import('@pages/dev-ui-showcase').then((m) => ({
        default: m.UiShowcasePage,
      })),
    )
  : null;

function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RootLayout />}>
          <Route index element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/me" element={<MyPage />} />
          <Route path="/me/password" element={<ChangePasswordPage />} />
          <Route path="/realtime" element={<RealtimePage />} />
          {UiShowcasePage ? (
            <Route
              path="/dev/ui-showcase"
              element={
                <Suspense fallback={<p className="text-sm text-slate-500">Showcase 로딩 중...</p>}>
                  <UiShowcasePage />
                </Suspense>
              }
            />
          ) : null}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}

export default App;
