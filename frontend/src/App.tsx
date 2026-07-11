import { Navigate, Route, Routes } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ItemsPage from "./pages/ItemsPage";
import MyPage from "./pages/MyPage";
import RealtimePage from "./pages/RealtimePage";

// /login, /register → GuestRoute (토큰 있으면 /items)
// 그 외 보호 페이지 → ProtectedRoute (토큰 없으면 /login)
function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/me" element={<MyPage />} />
          <Route path="/me/password" element={<ChangePasswordPage />} />
          <Route path="/realtime" element={<RealtimePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}

export default App;
