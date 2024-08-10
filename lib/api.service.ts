import { Injectable, HttpException, BadGatewayException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ApiService {
  constructor(private readonly httpService: HttpService) {}
  async getChart(pool: POOL, tokenA: string, tokenB: string) {
    const url = `https://api.stxtools.io/pools/${pool}_${tokenA}_${tokenB}/ohlc`;
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
}
