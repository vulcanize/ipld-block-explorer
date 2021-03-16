/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getLatestPrices
// ====================================================

export interface getLatestPrices_getLatestPrices {
  __typename: "TokenMarketInfo";
  id: string | null;
  symbol: string | null;
  name: string;
  image: string | null;
  contract: string | null;
  address: string | null;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  total_supply: string | null;
  price_change_percentage_24h: number | null;
}

export interface getAllContractsData_getAllContractsData {
  name: string;
  contractId: number;
  address: string;
}
export interface getAllContracts_getAllContracts {
  __typename: "AllContracts";
  nodes: getAllContractsData_getAllContractsData
  // id: string | null;
  // symbol: string | null;
  // name: string;
  // image: string | null;
  // contract: string | null;
  // address: string | null;
  // current_price: number | null;
  // market_cap: number | null;
  // total_volume: number | null;
  // total_supply: string | null;
  // price_change_percentage_24h: number | null;
}

export interface getLatestPrices {
  getLatestPrices: (getLatestPrices_getLatestPrices | null)[];
}
