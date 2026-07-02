import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// 일반적인 로그인 페이지 형태(아이디/비밀번호).
// 아직 백엔드 로그인 API가 없어서, 지금은 가짜 토큰을 저장하는 "준비" 단계입니다.
// 나중에 실제 인증이 생기면 handleSubmit 안에서 로그인 API를 호출하고
// 응답으로 받은 토큰을 login() 에 넘겨주면 됩니다.
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    // TODO: 실제 로그인 API 연동
    // const res = await apiClient.post("/auth/login", { username, password });
    // login(res.data.access_token);
    const fakeToken = `dev-token-${username}`;
    login(fakeToken);
    navigate("/items");
  };

  return (
    <div style={{ maxWidth: 320, margin: "0 auto" }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>아이디</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />
        </label>
        <label style={{ display: "grid", gap: 4 }}>
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
          />
        </label>
        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        <button type="submit">로그인 (임시)</button>
      </form>
      <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
        아직 실제 인증은 없습니다. 아무 값이나 입력하면 로그인 처리됩니다.
      </p>
    </div>
  );
}
