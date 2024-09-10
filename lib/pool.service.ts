import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiService } from './api.service';
import BigNumber from 'bignumber.js';
import { contractDTOV2, ContractService } from './contract.service';

@Injectable()
export class PoolService {
  constructor(
    private readonly httpService: HttpService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService,
  ) {}
  async getTxns(dto: recordDTO) {
    // const limit = dto.offset == 0 ? 50 : dto.offset >= 50 ? 50 : dto.offset;
    const limit = 50;
    const offset = dto.offset >= 50 ? dto.offset : 0;
    let url = `https://api.hiro.so/extended/v2/addresses/SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.${dto.contractName}/transactions?limit=${limit}`;
    if (offset > 0) {
      url = `https://api.hiro.so/extended/v2/addresses/SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.${dto.contractName}/transactions?limit=${limit}&offset=${offset}`;
    }
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Content-Type': 'application/json',
          'x-api-key': '10a0b6d06387564651f3c26a75474a82',
        },
        timeout: 500000,
      }),
    );
    return response.data as TransactionResponse;
  }

  async getTokenDecimal(token: string) {
    const splitToken = token.split('.');
    const data: contractDTOV2 = {
      address: splitToken[0],
      contract: splitToken[1],
      function: 'get-decimals',
      arguments: [],
    };
    const decimals = await this.contractService.readContractV2(data);
    return decimals;
  }

  async getUSDValueToken(token: string, amount: string) {
    const chartData = await this.apiService.getChartDataV2(token);
    if (chartData.length > 0) {
      const lastPrice = chartData[chartData.length - 1].close;
      const tokenDecimal = await this.getTokenDecimal(token);
      return new BigNumber(lastPrice)
        .multipliedBy(
          new BigNumber(amount).dividedBy(new BigNumber(10).pow(tokenDecimal)),
        )
        .toFixed();
    } else {
      return '0';
    }
  }

  async getUSDValueSTX(amount: string) {
    const chartData = await this.apiService.getSTXData();
    const lastPrice = chartData[chartData.length - 1][4];
    return new BigNumber(lastPrice)
      .multipliedBy(new BigNumber(amount).dividedBy(new BigNumber(10).pow(6)))
      .toFixed();
  }

  async recordTxnData(dto: recordDTOV3) {
    try {
      const userMap = new Map<string, Array<string>>();
      const txRecord = await this.getTxns({ ...dto });
      const expected = txRecord.total - dto.offset;
      let count = 0;
      for (const result of txRecord.results) {
        if (count >= expected) {
          continue;
        }
        count++;
        if (dto.offset === txRecord.total) {
          return {
            data: [],
            nextOffset: dto.offset,
            totalTxns: txRecord.total,
          };
        }
        if (result.tx.tx_status !== 'success') continue;
        if (result.tx.tx_type === 'smart_contract') continue;
        if (result.tx.tx_type === 'token_transfer') continue;
        if (excludedContracts.includes(result.tx.contract_call.contract_id))
          continue;
        if (!allowedFunctions.includes(result.tx.contract_call.function_name))
          continue;

        const key = result.tx.contract_call.function_args[0].repr;

        const array = userMap.get(key.toString()) || [];
        userMap.set(key.toString(), [
          ...array,
          result.tx.post_conditions[0].principal.address.toString(),
        ]);
      }
      return {
        data: mapToObject(userMap),
        nextOffset: dto.offset + count,
        totalTxns: txRecord.total,
      };
    } catch (error) {
      if (error instanceof AggregateError) {
        for (const individualError of error.errors) {
          console.error(individualError); // Handle each error
        }
      } else {
        console.error(error); // Handle a single error
      }
      return null;
    }
  }
}

export type txVolumeOutput = {
  data: token[];
  nextOffset: number;
  totalTxns: number;
};

export class recordDTO {
  @IsNotEmpty()
  @IsString()
  contractName: string;

  @IsOptional()
  @IsNumber()
  offset: number;
}

export class recordDTOV2 {
  @IsNotEmpty()
  @IsString()
  contractName: string;
}

export class recordDTOV3 {
  @IsNotEmpty()
  @IsString()
  contractName: string;

  @IsOptional()
  @IsNumber()
  offset: number;

  @IsOptional()
  @IsNumber()
  totalTx: number;
}

type TransactionEvent = {
  transfer: number;
  mint: number;
  burn: number;
};

type TransactionEvents = {
  stx: TransactionEvent;
  ft: TransactionEvent;
  nft: TransactionEvent;
};

type ContractCall = {
  contract_id: string;
  function_name: string;
  function_signature: string;
  function_args: Array<{
    hex: string;
    repr: string;
    name: string;
    type: string;
  }>;
};

type TransactionResult = {
  hex: string;
  repr: string;
};

type principalData = {
  type_id: string;
  contract_name: string;
  address: string;
};

type assetData = {
  contract_name: string;
  asset_name: string;
  contract_address: string;
};

type postCondition = {
  type: string;
  condition_code: string;
  amount: string;
  principal?: principalData;
  asset?: assetData;
};

type Transaction = {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: postCondition[];
  anchor_mode: string;
  is_unanchored: boolean;
  block_hash: string;
  parent_block_hash: string;
  block_height: number;
  block_time: number;
  block_time_iso: string;
  burn_block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  parent_burn_block_time: number;
  parent_burn_block_time_iso: string;
  canonical: boolean;
  tx_index: number;
  tx_status: string;
  tx_result: TransactionResult;
  microblock_hash: string;
  microblock_sequence: number;
  microblock_canonical: boolean;
  event_count: number;
  events: any[];
  execution_cost_read_count: number;
  execution_cost_read_length: number;
  execution_cost_runtime: number;
  execution_cost_write_count: number;
  execution_cost_write_length: number;
  tx_type: string;
  contract_call: ContractCall;
};

type Result = {
  tx: Transaction;
  stx_sent: string;
  stx_received: string;
  events: TransactionEvents;
};

type TransactionResponse = {
  limit: number;
  offset: number;
  total: number;
  results: Result[];
};

export const mapToObject = <K extends string | number | symbol, V>(
  map: Map<K, V>,
): token[] => {
  const volume: token[] = [];
  map.forEach((value, key) => {
    volume.push({
      id: key as string,
      users: value as any,
    });
  });
  return volume;
};

export type token = {
  id: string;
  users: any;
};

const excludedContracts = [
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-staking-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-launchpad-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-launchpad-ext-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-distributor-v2',
];

const allowedFunctions = ['stake'];
