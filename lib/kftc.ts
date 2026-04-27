export type AccountRow = {
  bank_code_std: string;
  product_name: string;
  account_num_masked: string;
  balance_amt: number;
  activity_type: 'A' | 'I';
};

export type AccountSummary = {
  totalBalance: number;
  activeCount: number;
  inactiveCount: number;
  accounts: AccountRow[];
};

type KftcResponse = {
  rsp_code: string;
  rsp_message?: string;
  res_list?: Array<{
    bank_code_std: string;
    product_name?: string;
    account_num: string;
    balance_amt?: string;
    activity_type: 'A' | 'I';
  }>;
};

const KFTC_LIST_URL = 'https://openapi.openbanking.or.kr/v2.0/accountinfo/list';

function maskAccount(accountNum: string) {
  const visible = accountNum.slice(-4);
  return `****-****-${visible}`;
}

export async function fetchKftcAccounts(): Promise<AccountSummary> {
  const accessToken = process.env.KFTC_ACCESS_TOKEN;
  const authCode = process.env.KFTC_AUTH_CODE;

  if (!accessToken || !authCode) {
    return {
      totalBalance: 74812650,
      activeCount: 3,
      inactiveCount: 1,
      accounts: [
        {
          bank_code_std: '004',
          product_name: '입출금통장',
          account_num_masked: '****-****-1203',
          balance_amt: 12456150,
          activity_type: 'A'
        },
        {
          bank_code_std: '088',
          product_name: '적금',
          account_num_masked: '****-****-7721',
          balance_amt: 38000000,
          activity_type: 'A'
        },
        {
          bank_code_std: '090',
          product_name: '주택청약종합저축',
          account_num_masked: '****-****-2280',
          balance_amt: 24356500,
          activity_type: 'A'
        },
        {
          bank_code_std: '020',
          product_name: '휴면계좌',
          account_num_masked: '****-****-9820',
          balance_amt: 0,
          activity_type: 'I'
        }
      ]
    };
  }

  const payload = {
    auth_code: authCode,
    inquiry_bank_type: '1',
    trace_no: `${Math.floor(Math.random() * 1_000_000)}`.padStart(6, '0'),
    inquiry_record_cnt: '30'
  };

  const res = await fetch(KFTC_LIST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`KFTC API call failed: ${res.status}`);
  }

  const data = (await res.json()) as KftcResponse;

  if (data.rsp_code !== 'A0000') {
    throw new Error(`KFTC API error: ${data.rsp_code} ${data.rsp_message ?? ''}`);
  }

  const accounts = (data.res_list ?? []).map((item) => ({
    bank_code_std: item.bank_code_std,
    product_name: item.product_name ?? '계좌',
    account_num_masked: maskAccount(item.account_num),
    balance_amt: Number(item.balance_amt ?? '0'),
    activity_type: item.activity_type
  }));

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance_amt, 0);

  return {
    totalBalance,
    activeCount: accounts.filter((acc) => acc.activity_type === 'A').length,
    inactiveCount: accounts.filter((acc) => acc.activity_type === 'I').length,
    accounts
  };
}
