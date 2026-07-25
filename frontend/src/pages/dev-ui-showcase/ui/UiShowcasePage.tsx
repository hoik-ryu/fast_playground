import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { formatDate, formatDateTime, formatRelativeTime, isValidDate } from '@shared/lib/date';
import { SalesBarChart, SalesLineChart, SalesPieChart } from '@shared/ui/chart';
import { FormField, FormInput, NumberInput, SubmitButton } from '@shared/ui/form';
import { AppIcon, type AppIconName, iconMap } from '@shared/ui/icon';
import { KanbanBoard, type KanbanBoardData, type KanbanChangeEvent } from '@shared/ui/kanban';

import {
  showcaseBarData,
  showcaseKanbanBoard,
  showcaseLineData,
  showcasePieData,
} from '../model/mock';

const showcaseFormSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력하세요.').max(40, '40자 이하여야 합니다.'),
  amount: z.number({ error: '금액을 입력하세요.' }).min(0, '0 이상이어야 합니다.'),
});

type ShowcaseFormValues = z.infer<typeof showcaseFormSchema>;

const sampleNow = new Date().toISOString();
const sampleInvalid = 'not-a-date';

export function UiShowcasePage() {
  const [kanban, setKanban] = useState<KanbanBoardData>(showcaseKanbanBoard);
  const [lastMove, setLastMove] = useState<string>('아직 이동 없음');

  const form = useForm<ShowcaseFormValues>({
    resolver: zodResolver(showcaseFormSchema),
    defaultValues: {
      title: '',
      amount: undefined as unknown as number,
    },
  });

  const iconNames = Object.keys(iconMap) as AppIconName[];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
          Development only
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">UI Showcase</h1>
        <p className="mt-1 text-sm text-slate-500">
          Form / Day.js / Lucide / Charts / Kanban 공통 컴포넌트 확인용입니다. 제품 메뉴에는
          노출되지 않으며 development 빌드에서만 라우트가 등록됩니다.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Form + Zod</h2>
        <FormProvider {...form}>
          <form
            className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            noValidate
            onSubmit={form.handleSubmit(() => {
              form.reset({ title: '', amount: undefined as unknown as number });
            })}
          >
            <FormField<ShowcaseFormValues> name="title" label="제목" required>
              <FormInput placeholder="수주 기회 제목" />
            </FormField>
            <FormField<ShowcaseFormValues> name="amount" label="금액" required>
              <NumberInput placeholder="0" min={0} />
            </FormField>
            <SubmitButton pendingLabel="검증 중...">검증만 실행</SubmitButton>
          </form>
        </FormProvider>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Day.js</h2>
        <dl className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">formatDate</dt>
            <dd className="font-medium text-slate-900">{formatDate(sampleNow)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">formatDateTime</dt>
            <dd className="font-medium text-slate-900">{formatDateTime(sampleNow)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">formatRelativeTime</dt>
            <dd className="font-medium text-slate-900">{formatRelativeTime(sampleNow)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">isValidDate(invalid)</dt>
            <dd className="font-medium text-slate-900">
              {String(isValidDate(sampleInvalid))} / {formatDate(sampleInvalid)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Lucide (iconMap)</h2>
        <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {iconNames.map((name) => (
            <div
              key={name}
              className="flex w-24 flex-col items-center gap-1 rounded-lg border border-slate-100 px-2 py-3 text-center"
            >
              <AppIcon name={name} size={20} />
              <span className="text-[10px] text-slate-500">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Charts</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <SalesBarChart title="월별 건수 (Bar)" data={showcaseBarData} />
          <SalesLineChart title="주간 추이 (Line)" data={showcaseLineData} />
          <SalesPieChart title="단계 비중 (Pie)" data={showcasePieData} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Kanban</h2>
          <p className="text-xs text-slate-500">{lastMove}</p>
        </div>
        <KanbanBoard
          board={kanban}
          onChange={(event: KanbanChangeEvent) => {
            setKanban(event.board);
            setLastMove(
              `${event.cardId}: ${event.fromColumnId} → ${event.toColumnId} (${event.fromIndex}→${event.toIndex})`,
            );
          }}
        />
      </section>
    </div>
  );
}
