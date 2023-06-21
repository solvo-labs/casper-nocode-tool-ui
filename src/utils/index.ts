import { fetchErc20TokenWithBalances, listofCreatorERC20Tokens } from "./api";

export const fetchContract = async (path: string) => {
  try {
    const wasmUrl = new URL(path, import.meta.url).href;
    const response = await fetch(wasmUrl);
    const buffer = await response.arrayBuffer();

    return buffer;
  } catch (error) {
    console.error("WebAssembly load error:", error);
  }
};

export const initTokens = async (accountHash: string) => {
  const currentErc20Tokens = await fetchErc20TokenWithBalances(accountHash);

  let finalData = currentErc20Tokens.map((dt) => {
    return {
      name: dt.contract_name,
      symbol: dt.metadata.symbol,
      decimals: dt.metadata.decimals,
      balance: Number(dt.balance) / Math.pow(10, dt.metadata.decimals),
      contractPackageHash: dt.contract_package_hash,
      contractHash: "",
    };
  });

  const creatorTokens = await listofCreatorERC20Tokens(accountHash);

  creatorTokens.forEach((ct) => {
    if (finalData.findIndex((fd) => fd.symbol !== ct.symbol) > -1) {
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
