import { Injectable, HttpException, BadGatewayException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}
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
        throw new BadGatewayException('Something went wrong');
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
}
