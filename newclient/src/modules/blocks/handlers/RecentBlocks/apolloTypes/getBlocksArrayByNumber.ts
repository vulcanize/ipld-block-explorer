/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getBlocksArrayByNumber
// ====================================================

export interface getBlocksArrayByNumber_getBlocksArrayByNumber_rewards {
  __typename: "BlockRewards";
  total: string;
}

export interface getBlocksArrayByNumber_getBlocksArrayByNumber {
  __typename: "BlockSummary";
  number: number;
  miner: string;
  txCount: number;
  timestamp: number;
  rewards: getBlocksArrayByNumber_getBlocksArrayByNumber_rewards;
  txFail: number;
}
export interface EthHeaderCidsBlock {
  id: number;
  blockNumber: string;
  blockHash: string;
  reward: string;
  cid: string;
  blockByMhKey: {
    data: string;
  }
  receiptRoot: string;
  td: string;
}

export interface allEthHeaderCids_allEthHeaderCids {
  __typename: "EthHeaderCidsConnection";
  nodes: EthHeaderCidsBlock[];
  totalCount: number;
}

export interface getBlocksArrayByNumber {
  getBlocksArrayByNumber: (getBlocksArrayByNumber_getBlocksArrayByNumber | null)[];
}

export interface getBlocksArrayByNumberVariables {
  fromBlock?: number | null;
  limit?: number | null;
}
