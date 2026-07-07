import { useEffect, useState } from "react";
import type { Item, ItemName } from "../types/item";
import { ITEM_NAMES } from "../types/item";
import {
  createItem,
  deleteItem,
  listItems,
  updateItem,
} from "../api/items";

// Item CRUD 테스트 화면.
// - 목록 조회로 API 호출 / CORS 동작을 한 번에 확인할 수 있습니다.
// - 생성/수정/삭제로 CRUD 전체 흐름을 테스트합니다.

interface FormState {
  name: ItemName | "";
  price: string;
  is_offer: boolean;
}

const emptyForm: FormState = { name: "", price: "", is_offer: false };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listItems();
      setItems(data);
    } catch (err) {
      setError(toMessage(err));
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
    setError(null);

    if (!form.name || Number.isNaN(Number(form.price))) {
      setError("과일 이름과 가격을 올바르게 입력하세요.");
      return;
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      is_offer: form.is_offer,
    };

    try {
      if (editingId === null) {
        await createItem(payload);
      } else {
        await updateItem(editingId, payload);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError(toMessage(err));
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      name: item.name as ItemName,
      price: String(item.price),
      is_offer: Boolean(item.is_offer),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제할까요?")) return;
    setError(null);
    try {
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      setError(toMessage(err));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Items</h2>
        <button onClick={loadItems} disabled={loading}>
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      {error && (
        <p style={{ color: "crimson" }}>오류: {error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          margin: "16px 0",
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <select
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value as ItemName | "" })
          }
        >
          <option value="">과일 선택</option>
          {ITEM_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          placeholder="가격"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={form.is_offer}
            onChange={(e) => setForm({ ...form, is_offer: e.target.checked })}
          />
          할인
        </label>
        <button type="submit">{editingId === null ? "추가" : "수정"}</button>
        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            취소
          </button>
        )}
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>이름</th>
            <th style={{ padding: 8 }}>가격</th>
            <th style={{ padding: 8 }}>할인</th>
            <th style={{ padding: 8 }}>동작</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: 12, color: "#888" }}>
                데이터가 없습니다.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{item.id}</td>
              <td style={{ padding: 8 }}>{item.name}</td>
              <td style={{ padding: 8 }}>{item.price}</td>
              <td style={{ padding: 8 }}>{item.is_offer ? "O" : "-"}</td>
              <td style={{ padding: 8, display: "flex", gap: 8 }}>
                <button onClick={() => handleEdit(item)}>수정</button>
                <button onClick={() => handleDelete(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// axios 에러를 사람이 읽을 수 있는 메시지로 변환.
function toMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: { detail?: unknown; message?: string } } })
      .response?.data;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
    if (data?.detail) {
      return typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}
