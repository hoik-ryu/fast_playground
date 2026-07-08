import { useRef, useState } from "react";
import {
  exportAccountingCsv,
  exportMemoCsv,
  exportSummaryCsv,
  uploadAccountingPdf,
} from "../api/accounting";
import {
  ACCOUNTING_CATEGORIES,
  type AccountingMemo,
  type AccountingSummary,
  type AccountingTransaction,
} from "../types/accounting";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatMoney(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

const COLUMNS = [
  "날짜",
  "연도",
  "월",
  "내용",
  "입금",
  "출금",
  "비고",
  "원본페이지",
  "분류",
] as const;

export default function AccountingOcrPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState<AccountingTransaction[]>([]);
  const [memos, setMemos] = useState<AccountingMemo[]>([]);
  const [summaries, setSummaries] = useState<AccountingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalIncome = rows.reduce((s, r) => s + (r.income ?? 0), 0);
  const totalExpense = rows.reduce((s, r) => s + (r.expense ?? 0), 0);
  const mismatchCount = summaries.filter((s) => !s.matched).length;

  const pickFile = (f: File | null) => {
    if (f && f.type !== "application/pdf") {
      setError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    setError(null);
    if (!file) {
      setError("PDF 파일을 선택하세요.");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadAccountingPdf(file);
      setRows(data.transactions);
      setMemos(data.memos);
      setSummaries(data.summaries);
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (index: number, category: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, category } : row)),
    );
  };

  const handleMemoChange = (index: number, text: string) => {
    setMemos((prev) =>
      prev.map((memo, i) => (i === index ? { ...memo, text } : memo)),
    );
  };

  const handleDownloadCsv = async () => {
    setError(null);
    if (rows.length === 0) {
      setError("먼저 PDF 를 업로드해 거래내역을 만들어 주세요.");
      return;
    }
    try {
      const blob = await exportAccountingCsv(rows);
      downloadBlob(blob, "accounting.csv");
    } catch (err) {
      setError(toMessage(err));
    }
  };

  const handleDownloadMemoCsv = async () => {
    setError(null);
    if (memos.length === 0) {
      setError("저장할 메모가 없습니다.");
      return;
    }
    try {
      const blob = await exportMemoCsv(memos);
      downloadBlob(blob, "accounting_memo.csv");
    } catch (err) {
      setError(toMessage(err));
    }
  };

  const handleDownloadSummaryCsv = async () => {
    setError(null);
    if (summaries.length === 0) {
      setError("저장할 합계 검증 결과가 없습니다.");
      return;
    }
    try {
      const blob = await exportSummaryCsv(summaries);
      downloadBlob(blob, "accounting_summary.csv");
    } catch (err) {
      setError(toMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-10 text-white shadow-lg sm:px-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          회계장부 OCR → CSV
        </h1>
        <p className="mt-2 max-w-xl text-indigo-100">
          스캔한 종이 장부 PDF를 업로드하면 OCR로 거래내역을 추출하고, 월 계·총
          합계를 자동 검증한 뒤 CSV로 내려받을 수 있습니다.
        </p>
      </section>

      {/* Upload */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">PDF 업로드</h2>
        <p className="mt-1 text-sm text-slate-500">
          파일을 끌어다 놓거나 클릭해서 선택하세요. (12장 이상도 자동 분할 처리)
        </p>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files[0] ?? null);
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition ${
            dragOver
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <svg
            className="mb-3 h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          {file ? (
            <p className="font-medium text-indigo-700">{file.name}</p>
          ) : (
            <p className="text-sm text-slate-500">
              PDF 파일을 여기에 놓거나 클릭하세요
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {loading ? "OCR 처리 중..." : "업로드 & OCR"}
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={rows.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            거래내역 CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadMemoCsv}
            disabled={memos.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            메모 CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadSummaryCsv}
            disabled={summaries.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            합계검증 CSV
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {/* Stats */}
      {rows.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="거래 건수" value={`${rows.length}건`} />
          <StatCard label="메모 페이지" value={`${memos.length}장`} />
          <StatCard
            label="입금 합계"
            value={formatMoney(totalIncome)}
            accent="text-emerald-600"
          />
          <StatCard
            label="출금 합계"
            value={formatMoney(totalExpense)}
            accent="text-rose-600"
          />
        </section>
      )}

      {/* Transactions */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">거래내역</h2>
          <p className="text-sm text-slate-500">
            분류는 드롭다운에서 수정할 수 있습니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {COLUMNS.map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    아직 데이터가 없습니다. PDF를 업로드하세요.
                  </td>
                </tr>
              )}
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-50 transition hover:bg-slate-50/50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">
                    {row.date}
                  </td>
                  <td className="px-4 py-2.5">{row.year}</td>
                  <td className="px-4 py-2.5">{row.month}</td>
                  <td className="max-w-[200px] truncate px-4 py-2.5">
                    {row.description}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-emerald-600">
                    {row.income != null ? row.income.toLocaleString() : ""}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-rose-600">
                    {row.expense != null ? row.expense.toLocaleString() : ""}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-2.5 text-slate-500">
                    {row.note}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-400">
                    {row.sourcePage}
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={row.category}
                      onChange={(e) =>
                        handleCategoryChange(index, e.target.value)
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      {ACCOUNTING_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      {!ACCOUNTING_CATEGORIES.includes(
                        row.category as (typeof ACCOUNTING_CATEGORIES)[number],
                      ) && (
                        <option value={row.category}>{row.category}</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary verification */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              합계 검증
            </h2>
            <p className="text-sm text-slate-500">
              장부에 적힌 월 계·총 합계와 거래내역 합산값을 대조합니다.
            </p>
          </div>
          {summaries.length > 0 && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                mismatchCount === 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {mismatchCount === 0
                ? "전체 일치"
                : `${mismatchCount}건 불일치`}
            </span>
          )}
        </div>

        {summaries.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            합계 행이 인식되지 않았습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {["구분", "연/월", "항목", "장부값", "계산값", "차이", "결과"].map(
                    (col) => (
                      <th key={col} className="whitespace-nowrap px-4 py-3">
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {summaries.map((s, index) => (
                  <SummaryRows key={index} summary={s} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Memos */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">메모</h2>
          <p className="text-sm text-slate-500">
            표가 아닌 페이지(대부분 마지막 장)의 자유 텍스트입니다.
          </p>
        </div>
        {memos.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">
            메모 페이지가 없습니다.
          </p>
        ) : (
          <div className="space-y-4 p-6">
            {memos.map((memo, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
              >
                <div className="mb-2 text-xs font-medium text-slate-400">
                  원본페이지 {memo.sourcePage}
                </div>
                <textarea
                  value={memo.text}
                  onChange={(e) => handleMemoChange(index, e.target.value)}
                  rows={Math.max(3, memo.text.split("\n").length)}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold ${accent ?? "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function fmt(v?: number | null): string {
  return v == null ? "" : v.toLocaleString();
}

function CheckRow({
  kind,
  ym,
  item,
  stated,
  computed,
  diff,
}: {
  kind: string;
  ym: string;
  item: string;
  stated?: number | null;
  computed?: number | null;
  diff?: number | null;
}) {
  const ok = diff === 0;
  const diffText =
    diff == null ? "-" : (diff > 0 ? "+" : "") + diff.toLocaleString();
  const resultText = diff == null ? "확인불가" : ok ? "일치" : "불일치";

  return (
    <tr className="border-b border-slate-50 transition hover:bg-slate-50/50">
      <td className="px-4 py-2.5">{kind}</td>
      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{ym}</td>
      <td className="px-4 py-2.5">{item}</td>
      <td className="px-4 py-2.5 text-right">{fmt(stated)}</td>
      <td className="px-4 py-2.5 text-right">{fmt(computed)}</td>
      <td
        className={`px-4 py-2.5 text-right font-medium ${
          diff == null ? "text-slate-400" : ok ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {diffText}
      </td>
      <td className="px-4 py-2.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            diff == null
              ? "bg-slate-100 text-slate-500"
              : ok
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {resultText}
        </span>
      </td>
    </tr>
  );
}

function SummaryRows({ summary: s }: { summary: AccountingSummary }) {
  if (s.kind === "grand") {
    return (
      <CheckRow
        kind="총 합계"
        ym={`${s.year}`}
        item="잔액+월순액 = 총합계"
        stated={s.statedNet}
        computed={s.computedNet}
        diff={s.netDiff}
      />
    );
  }

  const ym = `${s.year}-${String(s.month).padStart(2, "0")}`;
  return (
    <>
      <CheckRow
        kind="월 계"
        ym={ym}
        item="입금 총계"
        stated={s.statedIncome}
        computed={s.computedIncome}
        diff={s.incomeDiff}
      />
      <CheckRow
        kind="월 계"
        ym={ym}
        item="출금 총계"
        stated={s.statedExpense}
        computed={s.computedExpense}
        diff={s.expenseDiff}
      />
    </>
  );
}

function toMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (
      err as { response?: { data?: { detail?: unknown; message?: string } } }
    ).response?.data;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
    if (data?.detail) {
      return typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}
