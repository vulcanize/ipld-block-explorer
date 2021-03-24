/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getBlockTsx
// ====================================================

export interface getBlockTransfers_getBlockTransfers {
  __typename: "EthTransactionCidsConnection";
  nodes: NodesTransaction [];
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    endCursor: string;
    startCursor: string;
  }
  totalCount: number;
}

export interface getBlockTransfers {
  getBlockTransfers: getBlockTransfers_getBlockTransfers;
}

export interface getBlockTransfersVariables {
  _number?: number | null;
}

export interface NodesTransaction {
  id: number;
  txHash: string;
  dst: string;
  src: string;
  ethHeaderCidByHeaderId: {
    blockNumber: string;
    timestamp: string;
  }
}

export interface allEthTransactionCids_allEthTransactionCids {
  __typename: "allEthTransactionCids";
  nodes: NodesTransaction [];
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    endCursor: string;
    startCursor: string;
  }
  totalCount: number;
}
