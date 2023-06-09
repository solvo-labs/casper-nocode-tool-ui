import axios from "axios";
import { ERC20Token } from "./types";

const api = "https://event-store-api-clarity-testnet.make.services/";
const serverApi = "https://18.185.15.120:8000/";

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

  return data;
};

export const fetchErc20TokenMeta = async (contractPackage: string) => {
  const response = await axios.get<{ data: ERC20TokenInfo[] }>(api + "contract-packages/" + contractPackage);

  return response.data;
};

export const fetchErc20TokenWithBalances = async (accountHash: string) => {
  const tokens = await fetchErc20Tokens(accountHash.slice(13));
  const promises = tokens.map((tok) => fetchErc20TokenMeta(tok.contract_package_hash));

  const data = await Promise.all(promises);

  const finalData = data.map((dt: any, i: number) => {
    return { ...dt, balance: tokens[i].balance };
  });

  return finalData;
};

export const contractPackageHashToContractHash = async (contractPackageHash: string) => {
  const response = await axios.get(
    api + "extended-deploys?page=1&limit=1&fields=entry_point,contract_package&contract_package_hash=" + contractPackageHash + "&with_amounts_in_currency_id=1"
  );

  return response.data.data[0].contract_hash;
};

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  contractPackageHash: string;
  contractHash: string;
};

export const allTokensFromWallet = async (accountHash: string) => {
  const currentErc20Tokens = await fetchErc20TokenWithBalances(accountHash);

  const currentErc20TokensContractHashPromises = currentErc20Tokens.map((dt) => contractPackageHashToContractHash(dt.contract_package_hash));

  const currentErc20TokensContractHash = await Promise.all(currentErc20TokensContractHashPromises);

  let walletData: Token[] = currentErc20Tokens.map((dt, index) => {
    return {
      name: dt.contract_name,
      symbol: dt.metadata.symbol,
      decimals: dt.metadata.decimals,
      balance: Number(dt.balance) / Math.pow(10, dt.metadata.decimals),
      contractPackageHash: dt.contract_package_hash,
      contractHash: "hash-" + currentErc20TokensContractHash[index],
    };
  });

  return walletData;
};

export const initTokens = async (accountHash: string) => {
  const walletData = await allTokensFromWallet(accountHash);
  const creatorTokens = await listofCreatorERC20Tokens(accountHash);

  let finalData: Token[] = [...walletData];

  creatorTokens.forEach((ct) => {
    const isExist = walletData.findIndex((wd) => {
      return wd.contractHash === ct.contractHash;
    });

    if (isExist < 0) {
      finalData.push({
        name: ct.name,
        symbol: ct.symbol,
        decimals: parseInt(ct.decimals.hex, 16),
        balance: parseInt(ct.total_supply.hex, 16) / Math.pow(10, parseInt(ct.decimals.hex, 16)),
        contractPackageHash: "",
        contractHash: ct.contractHash,
      });
    }
  });

  return { creatorTokens, finalData };
};
