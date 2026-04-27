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

type Step = {
  id: number;
  title: string;
  subtitle: string;
  checklist: string[];
};

const KRW = new Intl.NumberFormat('ko-KR');

const steps: Step[] = [
  {
    id: 1,
    title: '벤치마크 / 요구사항 확정',
    subtitle: 'qld.kr 핵심 구조 분석 후 MVP 지표 정의',
    checklist: ['핵심 KPI 3개 확정', '카드형 정보계층 설계', '보안/개인정보 처리 범위 명시']
  },
  {
    id: 2,
    title: '환경 설치',
    subtitle: 'Next.js + TypeScript + Tailwind 실행 환경 구성',
    checklist: ['Node 20+ 확인', 'npm install / npm run dev', '로컬에서 API 라우트 호출 검증']
  },
  {
    id: 3,
    title: '금융결제원 API 연동',
    subtitle: '서버 Route Handler에서 계좌통합조회 호출',
    checklist: ['KFTC_ACCESS_TOKEN 적용', 'KFTC_AUTH_CODE 적용', '마스킹/에러처리/응답 가공']
  },
  {
    id: 4,
    title: '대시보드 UI 구현',
    subtitle: '요약 카드 + 계좌 비중 + Top5 리스트 노출',
    checklist: ['총 평가금액 카드', '활동/비활동 계좌 카드', '계좌 비중 시각화']
  },
  {
    id: 5,
    title: '배포 / 운영',
    subtitle: 'Vercel 배포 후 환경변수 설정 및 모니터링',
    checklist: ['Vercel 환경변수 등록', '로그/알림 설정', '토큰 재발급 절차 문서화']
  }
];

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
      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">개발 단계 · 1/5 ~ 5/5</p>
        <h1 className="mt-2 text-3xl font-semibold">qld.kr 벤치마크 내 계좌 대시보드</h1>
        <p className="mt-3 text-slate-600">
          요청하신 방식대로 단계형 개발 진행표와 실데이터(또는 데모데이터) 기반 계좌 요약 대시보드를 한 화면에
          구성했습니다.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="총 평가금액" value={data ? `${KRW.format(data.totalBalance)} 원` : '로딩 중...'} />
        <Card title="활동 계좌" value={data ? `${data.activeCount}개` : '-'} />
        <Card title="비활동 계좌" value={data ? `${data.inactiveCount}개` : '-'} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">계좌 잔액 Top 5</h2>
          <p className="mt-1 text-sm text-slate-500">금융결제원 계좌통합조회 응답을 서버에서 가공해 표시</p>
          {error ? <p className="mt-3 text-sm text-red-600">오류: {error}</p> : null}
          <ul className="mt-4 space-y-3">
            {topAccounts.map((acc) => (
              <li key={`${acc.bank_code_std}-${acc.account_num_masked}`} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
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
                {data?.totalBalance ? (
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.max(2, Math.round((acc.balance_amt / data.totalBalance) * 100))}%` }}
                    />
                  </div>
                ) : null}
              </li>
            ))}
            {!topAccounts.length ? <li className="text-sm text-slate-500">표시할 계좌가 없습니다.</li> : null}
          </ul>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">개발단계 1~5 진행표</h2>
          <ol className="mt-4 space-y-4">
            {steps.map((step) => (
              <li key={step.id} className="rounded-xl border p-4">
                <p className="text-sm font-semibold text-blue-700">STEP {step.id}</p>
                <p className="mt-1 font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.subtitle}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {step.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </article>
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
