import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { StatusCodes } from 'enums/statusCodes';
import { Injectable, HttpException, BadGatewayException } from '@nestjs/common';

@Injectable()
export class ApiService {
  private apiKey: string
  private apiEmail: string
  private cloudFlareBaseUrl: string

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.CLOUDFLARE_API_KEY
    this.apiEmail = process.env.CLOUDFLARE_API_EMAIL
    this.cloudFlareBaseUrl = `https://api.cloudflare.com/client/v4/accounts/`
  }

  async GET<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const observable = this.httpService.get<T>(url, { headers }).pipe(
      map(response => response.data)
    )
    return lastValueFrom(observable)
  }

  async POST<T>(url: string, data: any, headers?: Record<string, string>): Promise<T> {
    const observable = this.httpService.post<T>(url, data, { headers }).pipe(
      map(response => response.data)
    )
    return lastValueFrom(observable)
  }

  async getBalance(address: string) {
    const url = `https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`;
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      return result.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException('Something went wrong', StatusCodes.BadGateway);
      }
    }
  }

  async getChartData(token: string) {
    // const pools = await this.getPools();
    // const poolId = this.getPoolIdWithFallback(pools, token);
    const url = `https://api.stxtools.io/tokens/${token}/ohlc`;
    // const url = https://api.stxtools.io/tokens/SP125J1ADVYWGWB9NQRCVGKYAG73R17ZNMV17XEJ7.slime-token/ohlc
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);

      return result.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException('Something went wrong', StatusCodes.BadGateway);
      }
    }
  }

  async getSTXData() {
    const url = `https://data-api.binance.vision/api/v3/klines?symbol=STXUSDT&interval=15m&limit=10000`;
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      return result.data;
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new HttpException('Something went wrong', StatusCodes.BadGateway);
      }
    }
  }

  async getPools() {
    const url = `https://api.stxtools.io/pools`;
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);

      return result.data as Pool[];
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new BadGatewayException('Something went wrong');
      }
    }
  }

  getPoolIdWithFallback(
    pools: Pool[],
    baseTokenContractId: string,
  ): string | undefined {
    const preferredPool = pools.find(
      (pool) =>
        pool.base_token.contract_id === baseTokenContractId &&
        pool.target_token.contract_id === 'stx',
    );

    if (preferredPool) {
      return preferredPool.pool_id;
    }

    const fallbackPool = pools.find(
      (pool) => pool.base_token.contract_id === baseTokenContractId,
    );
    return fallbackPool?.pool_id;
  }

  async getVelarTokens() {
    const url = `https://sdk.velar.network/tokens`;
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      return result.data.data as VelarToken[];
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new BadGatewayException('Something went wrong');
      }
    }
  }

  async getAlexTokens() {
    const url = 'https://alex-sdk-api.alexlab.co';
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      return result.data.tokens as AlexToken[];
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new BadGatewayException('Something went wrong');
      }
    }
  }

  async getAlexPools() {
    const url = 'https://alex-sdk-api.alexlab.co';
    try {
      const response = this.httpService.get(url);
      const result = await lastValueFrom(response);
      return result.data.pools as AlexPool[];
    } catch (err) {
      if (err?.response?.data?.message) {
        throw new HttpException(err.response.data.message, err.response.status);
      } else {
        throw new BadGatewayException('Something went wrong');
      }
    }
  }

  cloudflarePOST<T>(path: string, data?: any) {
    return this.POST<T>(`${this.cloudFlareBaseUrl}/${path}`, data, {
      'X-Auth-Key': this.apiKey,
      'X-Auth-Email': this.apiEmail,
      'Content-Type': 'application/json'
    })
  }

  cloudflareGET<T>(path: string) {
    return this.GET<T>(`${this.cloudFlareBaseUrl}/${path}`, {
      'X-Auth-Key': this.apiKey,
      'X-Auth-Email': this.apiEmail,
      'Content-Type': 'application/json'
    })
  }
}
