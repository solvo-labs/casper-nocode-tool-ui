export type Token = {
  name: string;
  symbol: string;
  decimal: number;
  supply: number;
  description: string;
};

export type TransferValue = {
  receipentPubkey: string;
  amount: number;
};
