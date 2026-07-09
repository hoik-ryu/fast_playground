import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { toastError, toastSuccess } from "../utils/toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !password) {
      toastError("이메일, 이름, 비밀번호를 모두 입력하세요.");
      return;
    }

    if (password.length < 8) {
      toastError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const { data, message } = await registerUser({ email, name, password });

      if (!data.is_active) {
        navigate("/login", { replace: true, state: { message } });
        return;
      }

      toastSuccess(`${message} 로그인해 주세요.`);
      navigate("/login", { replace: true });
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">회원가입</h2>
        <p className="mt-1 text-sm text-slate-500">
          이메일, 이름, 비밀번호로 계정을 만듭니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있나요?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
