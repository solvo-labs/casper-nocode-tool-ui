import axios from "axios";
import { ERC20Token } from "./types";

const api = "https://event-store-api-clarity-testnet.make.services/";
const serverApi = "http://18.185.15.120:8000/";

// https://event-store-api-clarity-testnet.make.services/accounts/5e542e3bfacb53152a07322519eedd6f6cad1689508d588051603459b4b12590/erc20-tokens

// {
//   "data": [
//     {
//       "account_hash": "5e542e3bfacb53152a07322519eedd6f6cad1689508d588051603459b4b12590",
//       "contract_package_hash": "68b1633493084f655a634c8337539de858d918cde6a700b9d9e6de0394a23060",
//       "balance": "99999998500"
//     }
//   ]
// }

export type ERC20TokenInfo = {
  account_hash: string;
  contract_package_hash: string;
  balance: string;
};

export const fetchErc20Tokens = async (accountHash: string): Promise<ERC20TokenInfo[]> => {
  const response = await axios.get<{ data: ERC20TokenInfo[] }>(api + "accounts/" + accountHash + "/erc20-tokens");

  return response.data.data;
};

type NamedKey = {
  name: string;
  key: string;
};

export const fetchNamedKeys = async (accountHash: string) => {
  const stateRootHash = (await axios.get<string>(serverApi + "stateRootHash")).data;

  const response = await axios.get(api + "rpc/" + "state_get_item?state_root_hash=" + stateRootHash + "&key=" + accountHash);
  const namedKeys: NamedKey[] = response.data.result.stored_value.Account.named_keys;

  const filteredNamedKeys = namedKeys.filter((ky) => {
    return ky.name.startsWith("cep18_contract_hash");
  });

  return filteredNamedKeys;
};

export const fetchErc20TokenDetails = async (contractHash: string) => {
  const response = await axios.get<ERC20Token>(serverApi + "getERC20Token?contractHash=" + contractHash);

  return { ...response.data, contractHash };
};

export const listofCreatorERC20Tokens = async (accountHash: string) => {
  const namedKeys = await fetchNamedKeys(accountHash);

  const promises = namedKeys.map((nk) => fetchErc20TokenDetails(nk.key));

  const data = await Promise.all(promises);

  console.log(data);

  return data;
};
