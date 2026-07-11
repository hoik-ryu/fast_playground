import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changePassword } from "../api/users";
import { useAuth } from "../auth/AuthContext";
import { toastError, toastSuccess } from "../utils/toast";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

export default function ChangePasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toastError("모든 비밀번호 항목을 입력하세요.");
      return;
    }

    if (newPassword.length < 8) {
      toastError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      toastError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    setSaving(true);
    try {
      const message = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toastSuccess(`${message} 다시 로그인해 주세요.`);
      logout();
      navigate("/login", { replace: true });
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">비밀번호 변경</h2>
        <p className="mt-1 text-sm text-slate-500">
          현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              현재 비밀번호
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              새 비밀번호
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              새 비밀번호 확인
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`${inputClass} mt-1`}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            to="/me"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            마이페이지로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
