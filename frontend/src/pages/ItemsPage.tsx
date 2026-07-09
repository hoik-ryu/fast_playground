import { useEffect, useState } from "react";
import type { Item, ItemName } from "../types/item";
import { ITEM_NAMES } from "../types/item";
import {
  createItem,
  deleteItem,
  listItems,
  updateItem,
} from "../api/items";
import { toastError, toastSuccess } from "../utils/toast";

const FRUIT_EMOJI: Record<ItemName, string> = {
  사과: "🍎",
  바나나: "🍌",
  오렌지: "🍊",
  포도: "🍇",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

interface FormState {
  name: ItemName | "";
  price: string;
  is_offer: boolean;
}

const emptyForm: FormState = { name: "", price: "", is_offer: false };

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await listItems();
      setItems(data);
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || Number.isNaN(Number(form.price))) {
      toastError("과일 이름과 가격을 올바르게 입력하세요.");
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      is_offer: form.is_offer,
    };

    setSubmitting(true);
    try {
      if (editingId === null) {
        await createItem(payload);
        toastSuccess("상품이 추가되었습니다.");
      } else {
        await updateItem(editingId, payload);
        toastSuccess("상품이 수정되었습니다.");
      }
      resetForm();
      await loadItems();
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      name: item.name as ItemName,
      price: String(item.price),
      is_offer: Boolean(item.is_offer),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 상품을 삭제할까요?")) return;
    try {
      await deleteItem(id);
      toastSuccess("상품이 삭제되었습니다.");
      if (editingId === id) resetForm();
      await loadItems();
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    }
  };

  const offerCount = items.filter((item) => item.is_offer).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            상품 관리
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            과일 상품을 등록하고 목록을 관리합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={loadItems}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "불러오는 중..." : "목록 새로고침"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">전체 상품</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">할인 중</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{offerCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">평균 가격</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {items.length > 0
              ? formatPrice(
                  Math.round(
                    items.reduce((sum, item) => sum + item.price, 0) / items.length,
                  ),
                )
              : "-"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId === null ? "상품 추가" : "상품 수정"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {editingId === null
                ? "새 과일 상품을 등록합니다."
                : `ID ${editingId} 상품을 수정 중입니다.`}
            </p>
          </div>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              취소
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <label className="block sm:col-span-1">
            <span className="text-sm font-medium text-slate-700">과일</span>
            <select
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value as ItemName | "" })
              }
              className={`${inputClass} mt-1`}
            >
              <option value="">과일 선택</option>
              {ITEM_NAMES.map((name) => (
                <option key={name} value={name}>
                  {FRUIT_EMOJI[name]} {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-1">
            <span className="text-sm font-medium text-slate-700">가격 (원)</span>
            <input
              placeholder="예: 3500"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:col-span-1 sm:mt-6">
            <input
              type="checkbox"
              checked={form.is_offer}
              onChange={(e) => setForm({ ...form, is_offer: e.target.checked })}
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
            />
            <span className="text-sm font-medium text-slate-700">할인 상품</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 sm:col-span-1"
          >
            {submitting
              ? "저장 중..."
              : editingId === null
                ? "추가하기"
                : "수정 저장"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">상품 목록</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">이름</th>
                <th className="px-6 py-3">가격</th>
                <th className="px-6 py-3">할인</th>
                <th className="px-6 py-3 text-right">동작</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-base font-medium text-slate-600">
                      등록된 상품이 없습니다
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      위 폼에서 첫 상품을 추가해 보세요.
                    </p>
                  </td>
                </tr>
              )}

              {items.map((item) => {
                const fruitName = item.name as ItemName;
                const emoji = FRUIT_EMOJI[fruitName] ?? "🛒";
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isEditing ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <span className="text-lg" aria-hidden>
                          {emoji}
                        </span>
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      {item.is_offer ? (
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          할인
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
