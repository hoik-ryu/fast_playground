import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  createItem,
  deleteItem,
  itemFormDefaultValues,
  itemFormSchema,
  type ItemFormValues,
  updateItem,
} from '@features/manage-item';
import { type Item, ITEM_NAMES, type ItemName, useItems } from '@entities/item';
import { mapServerErrors } from '@shared/lib/form/mapServerErrors';
import { toastSuccess } from '@shared/lib/toast';
import { Checkbox, FormField, NumberInput, Select, SubmitButton } from '@shared/ui/form';
import { LoadingSpinner } from '@shared/ui/loading';
import { PageHeader } from '@shared/ui/page-header';

const FRUIT_EMOJI: Record<ItemName, string> = {
  사과: '🍎',
  바나나: '🍌',
  오렌지: '🍊',
  포도: '🍇',
};

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`;
}

export function ItemsPage() {
  const { data, isLoading, isFetching, refetch } = useItems();
  const items = data ?? [];
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: itemFormDefaultValues as ItemFormValues,
  });

  const resetForm = () => {
    form.reset(itemFormDefaultValues as ItemFormValues);
    setEditingId(null);
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    form.reset({
      name: item.name as ItemName,
      price: item.price,
      is_offer: Boolean(item.is_offer),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 상품을 삭제할까요?')) return;
    try {
      await deleteItem(id);
      toastSuccess('상품이 삭제되었습니다.');
      if (editingId === id) resetForm();
    } catch {
      // API 에러 toast 는 apiClient 인터셉터에서 처리
    }
  };

  const offerCount = items.filter((item) => item.is_offer).length;

  return (
    <div className="space-y-6">
      <PageHeader title="상품 관리" description="과일 상품을 등록하고 목록을 관리합니다.">
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetching ? <LoadingSpinner size="sm" /> : <span aria-hidden>↻</span>}
          {isFetching ? '불러오는 중...' : '목록 새로고침'}
        </button>
      </PageHeader>

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
                  Math.round(items.reduce((sum, item) => sum + item.price, 0) / items.length),
                )
              : '-'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId === null ? '상품 추가' : '상품 수정'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {editingId === null
                ? '새 과일 상품을 등록합니다.'
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

        <FormProvider {...form}>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            noValidate
            onSubmit={form.handleSubmit(async (values) => {
              const payload = {
                name: values.name,
                price: values.price,
                is_offer: values.is_offer,
              };

              try {
                if (editingId === null) {
                  await createItem(payload);
                  toastSuccess('상품이 추가되었습니다.');
                } else {
                  await updateItem(editingId, payload);
                  toastSuccess('상품이 수정되었습니다.');
                }
                resetForm();
              } catch (error) {
                mapServerErrors(error, form.setError);
              }
            })}
          >
            <FormField<ItemFormValues> name="name" label="과일" required>
              <Select>
                <option value="">과일 선택</option>
                {ITEM_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {FRUIT_EMOJI[name]} {name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField<ItemFormValues> name="price" label="가격 (원)" required>
              <NumberInput placeholder="예: 3500" min={0} />
            </FormField>

            <FormField<ItemFormValues>
              name="is_offer"
              label="할인 상품"
              className="sm:col-span-1 sm:mt-6"
            >
              <Checkbox />
            </FormField>

            <SubmitButton
              pendingLabel="저장 중..."
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 sm:col-span-1"
            >
              {editingId === null ? '추가하기' : '수정 저장'}
            </SubmitButton>
          </form>
        </FormProvider>
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
              {isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-base font-medium text-slate-600">등록된 상품이 없습니다</p>
                    <p className="mt-1 text-sm text-slate-400">
                      위 폼에서 첫 상품을 추가해 보세요.
                    </p>
                  </td>
                </tr>
              )}

              {items.map((item) => {
                const fruitName = item.name as ItemName;
                const emoji = FRUIT_EMOJI[fruitName] ?? '🛒';
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isEditing ? 'bg-indigo-50/60' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{item.id}</td>
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
                          onClick={() => void handleDelete(item.id)}
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
