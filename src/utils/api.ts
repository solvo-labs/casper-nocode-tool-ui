import axios from "axios";
import { ERC20Token, Listing, RaffleNamedKeys } from "./types";

const api = "https://event-store-api-clarity-testnet.make.services/";
export const SERVER_API = import.meta.env.DEV ? "http://localhost:3000/api/" : "https://casperdev.dappend.com/api/";
// export const SERVER_API = "https://casperdev.dappend.com/api/";

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

export const fetchAmount = async () => {
  const response = await axios.get(api + "rates/1/amount");
  return response.data.data;
};

type NamedKey = {
  name: string;
  key: string;
};

export const fetchNamedKeys = async (pubkey: string) => {
  const namedKeys = (await axios.get<NamedKey[]>(SERVER_API + "getNamedKeys?pubkey=" + pubkey)).data;

  return namedKeys;
};

const fetchCep18NamedKeys = async (pubkey: string) => {
  const namedKeys = await fetchNamedKeys(pubkey);

  const filteredNamedKeys = namedKeys.filter((ky: NamedKey) => {
    return ky.name.startsWith("cep18_contract_hash");
  });

  return filteredNamedKeys;
};

export const fetchVestingNamedKeys = async (pubkey: string) => {
  const namedKeys = await fetchNamedKeys(pubkey);

  const filteredNamedKeys = namedKeys.filter((ky: NamedKey) => {
    return ky.name.startsWith("vesting_contract_hash");
  });

  return filteredNamedKeys;
};

export const fetchCep78NamedKeys = async (pubkey: string) => {
  const namedKeys = await fetchNamedKeys(pubkey);

  const filteredNamedKeys = namedKeys.filter((ky: NamedKey) => {
    return ky.name.startsWith("cep78_contract_hash");
  });

  return filteredNamedKeys;
};

export const fetchMarketplaceNamedKeys = async (pubkey: string) => {
  const namedKeys = await fetchNamedKeys(pubkey);

  const filteredNamedKeys = namedKeys.filter((ky) => {
    return ky.name.startsWith("marketplace_contract_hash");
  });

  return filteredNamedKeys;
};
export const fetchRaffleNamedKeys = async (pubkey: string) => {
  const namedKeys = await fetchNamedKeys(pubkey);

  const filteredNamedKeys = namedKeys.filter((ky) => {
    return ky.name.startsWith("raffles_contract_hash");
  });

  const finalData: RaffleNamedKeys[] = filteredNamedKeys.map((rf: RaffleNamedKeys) => {
    let newName: string;
    if (rf.name.startsWith("raffles_contract_hash_")) {
      newName = rf.name.replace("raffles_contract_hash_", "").slice(0, -14);
      return { name: newName, key: rf.key };
    }
    return { name: rf.name, key: rf.key };
  });
  return finalData;
};

export const fetchErc20TokenDetails = async (contractHash: string) => {
  const response = await axios.get<ERC20Token>(SERVER_API + "getERC20Token?contractHash=" + contractHash);

  return { ...response.data, contractHash };
};

export const listofCreatorERC20Tokens = async (pubkey: string) => {
  const namedKeys = await fetchCep18NamedKeys(pubkey);

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

export const initTokens = async (accountHash: string, pubkey: string) => {
  const walletData = await allTokensFromWallet(accountHash);
  const creatorTokens = await listofCreatorERC20Tokens(pubkey);

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

export const getNftCollection = async (contractHash: string) => {
  const response = await axios.get<any>(SERVER_API + "getCollection?contractHash=" + contractHash);
  // console.log("response", response.data.json_schema);
  return { ...response.data, contractHash };
};

export const getNftMetadata = async (contractHash: string, index: string) => {
  const response = await axios.get<any>(SERVER_API + "getNftMetadata?contractHash=" + contractHash + "&index=" + index);
  return JSON.parse(response.data);
};

export const fetchIPFSImage = async (apiLink: string): Promise<string> => {
  const response = await axios.get<any>(apiLink);
  return response.data.image;
};

export const fetchMarketplaceData = async (contractHash: string) => {
  const response = await axios.get(SERVER_API + "getMarketplace?contractHash=" + contractHash);

  return { ...response.data, contractHash };
};

export const storeListing = async (marketplace: string, collection: string, tokenId: number, price: number, nft: any, listingIndex: number) => {
  const requestData: Listing = {
    marketplace,
    collection_hash: collection,
    tokenId,
    price,
    nftName: nft.name,
    nftDescription: nft.description,
    nftImage: nft.imageURL,
    listingIndex,
  };

  const response = await axios.post(SERVER_API + "add_listing", requestData);

  return { ...response.data };
};

export const getMarketplaceListing = async (contractHash: string) => {
  const response = await axios.get<Listing[]>(SERVER_API + "fetch_my_listing?contractHash=" + contractHash);

  return response.data;
};

export const getAllListingForSale = async () => {
  const response = await axios.get<Listing[]>(SERVER_API + "fetch_listing");

  return response.data;
};

export const getVestingDetails = async (contractHash: string) => {
  const response = await axios.get<any>(SERVER_API + "get_vesting_contract?contractHash=" + contractHash);

  return response.data;
};

export const contractHashToContractPackageHash = async (contractHash: string) => {
  const response = await axios.get(api + "contracts/" + contractHash + "?fields=contract_package");

  return response.data.contract_package_hash;
};

export const setVestingRecipients = async (contractHash: string) => {
  const response = await axios.get<any>(SERVER_API + "set_vesting_recipients?contractHash=" + contractHash);

  return response.data;
};

export const getVestingList = async (accountHash: string) => {
  const response = await axios.get<any>(SERVER_API + "get_vesting_list?accountHash=" + accountHash);

  return response.data;
};

export const getRaffleDetails = async (contractHash: string) => {
  const response = await axios.get<any>(SERVER_API + "get_raffle?contractHash=" + contractHash);
  return response.data;
};

export const getAllRafflesForJoin = async (contractHash: string) => {
  const response = await axios.get<any>(SERVER_API + "get_all_raffles?contractHash=" + contractHash);
  return response.data;
};

export const getValidators = async () => {
  const response = await axios.get(SERVER_API + "validators");

  return response.data;
};

export const getBalance = async (publicKey: string) => {
  const response = await axios.get(SERVER_API + "getBalance?publickey=" + publicKey);

  return response.data;
};
