export type Token = {
  name: string;
  symbol: string;
  decimal: number;
  supply: number;
  description: string;
};

export type TokenTransfer = {
  receipentPubkey: string;
  amount: number;
};

export type TokenApprove = {
  spenderPubkey: string;
  amount: number;
};
