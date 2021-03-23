/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BlockDetails
// ====================================================

export interface BlockDetails_summary_rewards {
  __typename: "BlockRewards";
  txFees: string;
  total: string;
  uncles: string;
}

export interface BlockDetails_summary {
  __typename: "BlockSummary";
  number: number;
  miner: string;
  txCount: number;
  timestamp: number;
  uncles: (string | null)[];
  rewards: BlockDetails_summary_rewards;
  txFail: number;
}

export interface HeaderDetails {
  __typename: "Header";
  // summary: BlockDetails_summary;
  blockHash: string;
  parentHash: string;
  blockNumber: string;
  reward: string;
  timestamp: string;
  time: string;
  address: string;
  gasUsed: string | number;
  txRoot: string;
  receiptRoot: string;
  uncleHash: string;
  extra: string;
  stateRoot: string;
  nonce: string;
  transactionsCount: string;
  difficulty: string;
  gasLimit: string;
}
