'use client';

import { useEffect, useMemo, useState } from 'react';

type AccountRow = {
  bank_code_std: string;
  product_name: string;
  account_num_masked: string;
  balance_amt: number;
  activity_type: 'A' | 'I';
};

type ApiResponse = {
  totalBalance: number;
  activeCount: number;
  inactiveCount: number;
  accounts: AccountRow[];
};

const steps = [
  '1) 벤치마크/요건정의',
  '2) 환경세팅',
  '3) 금융결제원 API 연동',
  '4) 대시보드 UI 구현',
  '5) 배포/운영'
];

const KRW = new Intl.NumberFormat('ko-KR');

export default function HomePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/accounts')
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  const topAccounts = useMemo(
    () => (data?.accounts ?? []).slice().sort((a, b) => b.balance_amt - a.balance_amt).slice(0, 5),
    [data]
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">스택 선택 · 1~5 단계 개발</p>
        <h1 className="mt-2 text-3xl font-semibold">qld.kr 벤치마크 계좌 연동 대시보드</h1>
        <p className="mt-3 text-slate-600">
          핵심 지표 카드 + 계좌 비중 리스트 + 단계별 진행 현황으로 qld.kr 스타일을 빠르게 복제합니다.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <span key={step} className="rounded-full bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {step}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="총 평가금액" value={data ? `${KRW.format(data.totalBalance)} 원` : '로딩 중...'} />
        <Card title="활동 계좌" value={data ? `${data.activeCount}개` : '-'} />
        <Card title="비활동 계좌" value={data ? `${data.inactiveCount}개` : '-'} />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">계좌 잔액 Top 5</h2>
        <p className="mt-1 text-sm text-slate-500">금융결제원 계좌통합조회 응답을 서버에서 가공해 표시</p>
        {error ? <p className="mt-3 text-sm text-red-600">오류: {error}</p> : null}
        <ul className="mt-4 space-y-3">
          {topAccounts.map((acc) => (
            <li key={`${acc.bank_code_std}-${acc.account_num_masked}`} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{acc.product_name}</p>
                  <p className="text-sm text-slate-500">
                    기관코드 {acc.bank_code_std} · {acc.account_num_masked}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{KRW.format(acc.balance_amt)} 원</p>
                  <p className="text-sm text-slate-500">{acc.activity_type === 'A' ? '활동성' : '비활동성'}</p>
                </div>
              </div>
            </li>
          ))}
          {!topAccounts.length ? <li className="text-sm text-slate-500">표시할 계좌가 없습니다.</li> : null}
        </ul>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
