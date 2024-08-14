import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { StatusCodes } from 'enums/statusCodes';
import { Injectable, HttpException, BadGatewayException } from '@nestjs/common';
import ccxt from 'ccxt';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}

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
    const pools = await this.getPools();
    const poolId = this.getPoolIdWithFallback(pools, token);
    const url = `https://api.stxtools.io/pools/${poolId}/ohlc`;
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

  async getSTXChart() {
    const myex = new ccxt.binance({});
    const ohlcv = await myex.fetchOHLCV('STX/USDT');
    return ohlcv;
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
}
