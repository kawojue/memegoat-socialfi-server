type POOL = 'ALEX' | 'VELAR';

type Token = {
  contract_id: string;
  image_url: string;
  symbol: string;
  name: string;
  decimals: number;
  circulating_supply: string;
  total_supply: string;
};

type Pool = {
  pool_id: string;
  pool_platform: string;
  liquidity_usd: number;
  base_token: Token;
  target_token: Token;
  metrics: {
    swap_count: number;
    price_usd: number;
    volume_1h_usd: number | null;
    volume_6h_usd: number | null;
    volume_1d_usd: number | null;
    volume_7d_usd: number | null;
    price_change_1d: number | null;
    price_change_7d: number | null;
    price_change_30d: number | null;
  };
};

type VelarToken = {
  symbol: string;
  name: string;
  contractAddress: string;
  price: string;
  tokenDecimalNum: number;
  assetName: string;
  vsymbol: string;
};
