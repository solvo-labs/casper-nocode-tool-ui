import axios from "axios";

const api = "https://event-store-api-clarity-testnet.make.services/";
const serverApi = "http://localhost:1923/";

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

  const response = await axios.get(api + "rpc/" + "state_get_item?state_root_hash=" + stateRootHash + "&key=account-hash-" + accountHash);

  return response.data.result.stored_value.Account.named_keys as NamedKey[];
};
