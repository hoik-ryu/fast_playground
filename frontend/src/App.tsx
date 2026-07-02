import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ItemsPage from "./pages/ItemsPage";
import RealtimePage from "./pages/RealtimePage";

// 라우팅 구성.
// - /login 은 누구나 접근 가능
// - 나머지는 ProtectedRoute 로 감싸 로그인(준비)된 경우에만 접근.
//   아직 로그인 없이 바로 테스트하고 싶으면 ProtectedRoute 를 벗겨내면 됩니다.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/realtime" element={<RealtimePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}

export default App;
