import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// 아주 간단한 상단 메뉴 + 본문 영역.
// 메뉴는 여기 navItems 배열만 늘리면 됩니다.
const navItems = [
  { to: "/items", label: "Items (CRUD)" },
  { to: "/realtime", label: "Realtime (WS/MQTT)" },
];

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: "1px solid #ddd",
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <strong style={{ fontSize: 18 }}>FastAPI Playground</strong>
        <nav style={{ display: "flex", gap: 12 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#646cff" : "#888",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginLeft: "auto" }}>
          {isAuthenticated ? (
            <button onClick={handleLogout}>로그아웃</button>
          ) : (
            <NavLink to="/login">로그인</NavLink>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
