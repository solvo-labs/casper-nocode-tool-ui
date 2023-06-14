export type ERC20Token = {
  name: string;
  symbol: string;
  decimal: number;
  supply: number;
};

export type TokenTransfer = {
  receipentPubkey: string;
  amount: number;
};

export type TokenApprove = {
  spenderPubkey: string;
  amount: number;
};
