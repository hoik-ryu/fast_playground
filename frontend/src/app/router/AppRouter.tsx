import { Routes } from 'react-router-dom';

import { appRoutes } from './routes';

/** 앱의 라우트 트리를 <Routes>로 렌더링하는 컴포넌트. */
export function AppRouter() {
  return <Routes>{appRoutes}</Routes>;
}
