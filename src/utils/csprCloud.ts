import axios from "axios";
import { SERVER_API } from "./api";

export const getContractPackageNFTs = async (contract_hash: string) => {
  const response = await axios.get(SERVER_API + "getContractPackageNFTs?contract_hash=" + contract_hash);
  return response.data;
};

export const getTokens = async (account_identifier: string) => {
  const response = await axios.get(SERVER_API + "getTokens?account_identifier=" + account_identifier);
  return response.data;
};
