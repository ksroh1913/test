# KFTC 계좌 연동 대시보드 (qld.kr 벤치마크)

qld.kr 레이아웃을 참고해 **내 계좌 연동 대시보드**를 5단계로 추진할 수 있도록 구성한 Next.js 예제입니다.

## 개발 단계 1~5

### 1) 벤치마크/요건정의
- 목표 화면: 상단 KPI + 계좌 Top 리스트 + 진행 단계
- 핵심 지표: 총 평가금액, 활동/비활동 계좌 수, 잔액 상위 계좌

### 2) 환경 설치
```bash
npm install
npm run dev
```

### 3) 금융결제원 API 연동
- API Route: `app/api/accounts/route.ts`
- 연동 모듈: `lib/kftc.ts`
- 민감정보는 서버 환경변수로만 처리

```bash
cp .env.example .env.local
```

`.env.local`
```bash
KFTC_ACCESS_TOKEN=발급받은_access_token
KFTC_AUTH_CODE=사용자정보확인_후_받은_auth_code
```

> 환경변수가 없으면 개발 편의를 위해 데모 데이터가 표시됩니다.

### 4) UI 구현
- `app/page.tsx`에 단계 진행표 + KPI 카드 + Top5 계좌 리스트 구현
- 잔액 비중을 바 형태로 표시해 계좌 구성 직관화

### 5) 배포
- Vercel 프로젝트 연결
- 환경변수 등록: `KFTC_ACCESS_TOKEN`, `KFTC_AUTH_CODE`
- 배포 후 `/api/accounts` 응답 확인

## 보안/운영 체크리스트
- 토큰/코드는 절대 클라이언트 번들에 포함하지 않기
- 계좌번호 마스킹 출력 유지
- KFTC 토큰 만료/재발급 운영 절차 문서화
