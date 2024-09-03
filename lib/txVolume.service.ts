import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiService } from './api.service';
import BigNumber from 'bignumber.js';
import { contractDTOV2, ContractService } from './contract.service';

@Injectable()
export class TxnVolumeService {
  constructor(
    private readonly httpService: HttpService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService,
  ) {}
  async getTxns(dto: recordDTO) {
    let url = `https://api.hiro.so/extended/v2/addresses/SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.${dto.contractName}/transactions?limit=50`;
    if (dto.offset) {
      url = `https://api.hiro.so/extended/v2/addresses/SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.${dto.contractName}/transactions?limit=50&offset=${dto.offset}`;
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

  async recordTxnData(dto: recordDTO) {
    try {
      const tokenMap = new Map<string, number>();
      const limit = 50;
      const txRecord = await this.getTxns(dto);
      for (const result of txRecord.results) {
        if (result.tx.tx_status !== 'success') continue;
        if (result.tx.tx_type === 'smart_contract') continue;
        if (result.tx.tx_type === 'token_transfer') continue;
        if (excludedContracts.includes(result.tx.contract_call.contract_id))
          continue;
        if (!allowedFunctions.includes(result.tx.contract_call.function_name))
          continue;
        console.log(result.tx.contract_call.function_name);
        if (result.stx_received !== '0') {
          const currentSTX = tokenMap.get('STX') || 0;
          tokenMap.set('STX', currentSTX + Number(result.stx_received));
        }
        // Process post conditions for fungible tokens
        for (const pc of result.tx.post_conditions) {
          console.log(pc);
          if (pc.type === 'fungible') {
            const token = `${pc.asset.contract_address}.${pc.asset.contract_name}`;
            const currentTokenAmount = tokenMap.get(token) || 0;
            tokenMap.set(token, currentTokenAmount + Number(pc.amount));
          } else if (pc.type === 'stx') {
            const currentSTX = tokenMap.get('STX') || 0;
            tokenMap.set('STX', currentSTX + Number(pc.amount));
          }
        }
      }
      let nextOffset = dto.offset + limit;
      if (nextOffset > txRecord.total) {
        nextOffset = txRecord.total;
      }
      return {
        data: mapToObject(tokenMap),
        nextOffset: nextOffset,
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
      token: key as string,
      amount: value as any,
    });
  });
  return volume;
};

export type token = {
  token: string;
  amount: any;
};

const excludedContracts = [
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-staking-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-launchpad-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-launchpad-ext-v1',
  'SP2F4QC563WN0A0949WPH5W1YXVC4M1R46QKE0G14.memegoat-distributor-v2',
];

const allowedFunctions = [
  'lock-token',
  'increment-lock',
  'create-pool',
  'stake',
  'buy-otc',
  'dex-swap',
  'cross-dex-swap',
];
