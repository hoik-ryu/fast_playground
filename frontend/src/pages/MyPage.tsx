import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserContext, updateCurrentUser } from "../api/users";
import {
  useCurrentUser,
  useCurrentUserActions,
} from "../hooks/useCurrentUser";
import type { UserMeContext } from "../types/auth";
import { toastError, toastSuccess } from "../utils/toast";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MyPage() {
  const { user, loading } = useCurrentUser();
  const { fetchUser } = useCurrentUserActions();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState<UserMeContext | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setContext(null);
      return;
    }

    let cancelled = false;
    void getUserContext()
      .then((data) => {
        if (!cancelled) setContext(data);
      })
      .catch(() => {
        if (!cancelled) setContext(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      toastError("이름을 입력하세요.");
      return;
    }

    if (user && trimmed === user.name) {
      toastError("변경된 내용이 없습니다.");
      return;
    }

    setSaving(true);
    try {
      const { data, message } = await updateCurrentUser({ name: trimmed });
      await fetchUser();
      setName(data.name);
      toastSuccess(message);
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        내 정보를 불러오는 중...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">마이페이지</h2>
        <p className="mt-1 text-sm text-slate-500">
          계정 정보를 확인하고 이름을 변경할 수 있습니다.
        </p>

        <dl className="mt-6 space-y-4 rounded-xl bg-slate-50 p-4 text-sm">
          <div>
            <dt className="font-medium text-slate-500">이메일</dt>
            <dd className="mt-1 text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">가입일</dt>
            <dd className="mt-1 text-slate-900">{formatDate(user.created_at)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">권한</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span
                    key={role.id}
                    className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                  >
                    {role.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">없음</span>
              )}
            </dd>
          </div>
        </dl>

        {context?.permissions.view_admin_stats && context.admin_stats && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">관리자 통계</p>
            <p className="mt-1 text-amber-800">
              전체 사용자 {context.admin_stats.total_users.toLocaleString("ko-KR")}명
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">이름</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoComplete="name"
              className={`${inputClass} mt-1`}
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-sm font-semibold text-slate-900">보안</h3>
          <p className="mt-1 text-sm text-slate-500">
            비밀번호를 변경하려면 현재 비밀번호 확인이 필요합니다.
          </p>
          <Link
            to="/me/password"
            className="mt-3 inline-flex rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            비밀번호 변경
          </Link>
        </div>
      </div>
    </div>
  );
}
