import { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';

import { ChangePasswordPage } from '@pages/change-password';
import { ItemsPage } from '@pages/items';
import { LoginPage } from '@pages/login';
import { MyPage } from '@pages/me';
import { NotFoundPage } from '@pages/not-found';
import { RealtimePage } from '@pages/realtime';
import { RegisterPage } from '@pages/register';
import { LoadingFallback } from '@shared/ui/loading';

import { RootLayout } from '../layouts/RootLayout';

import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTE_PATH } from './route-path';

const UiShowcasePage = import.meta.env.DEV
  ? lazy(() =>
      import('@pages/dev-ui-showcase').then((m) => ({
        default: m.UiShowcasePage,
      })),
    )
  : null;

/** <Routes> 내부에 렌더링되는 라우트 선언. AppRouter가 이 트리를 감싸 렌더링합니다. */
export const appRoutes = (
  <>
    <Route element={<GuestRoute />}>
      <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
      <Route path={ROUTE_PATH.REGISTER} element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<RootLayout />}>
        <Route index element={<Navigate to={ROUTE_PATH.ITEMS} replace />} />
        <Route path={ROUTE_PATH.ITEMS} element={<ItemsPage />} />
        <Route path={ROUTE_PATH.ME} element={<MyPage />} />
        <Route path={ROUTE_PATH.ME_PASSWORD} element={<ChangePasswordPage />} />
        <Route path={ROUTE_PATH.REALTIME} element={<RealtimePage />} />
        {UiShowcasePage ? (
          <Route
            path={ROUTE_PATH.DEV_UI_SHOWCASE}
            element={
              <Suspense fallback={<LoadingFallback message="Showcase 로딩 중..." />}>
                <UiShowcasePage />
              </Suspense>
            }
          />
        ) : null}
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </>
);
