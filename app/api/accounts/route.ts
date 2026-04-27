import { NextResponse } from 'next/server';
import { fetchKftcAccounts } from '@/lib/kftc';

export async function GET() {
  try {
    const data = await fetchKftcAccounts();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: '계좌 데이터 조회에 실패했습니다.',
        detail: error instanceof Error ? error.message : 'unknown error'
      },
      { status: 500 }
    );
  }
}
