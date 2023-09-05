export type ERC20Token = {
  name: string;
  symbol: string;
  decimals: { type: string; hex: string };
  total_supply: { type: string; hex: string };
  contractHash: string;
  enable_mint_burn: { type: string; hex: string };
};

export type ERC20TokenForm = {
  name: string;
  symbol: string;
  decimal: number;
  supply: number;
  enableMintBurn: boolean;
};

export type TokenTransfer = {
  receipentPubkey: string;
  amount: number;
};

export type TokenApprove = {
  spenderPubkey: string;
  amount: number;
};

export type Section = {
  name: string;
  amount: number;
  percent: number;
  isOldSection: boolean;
};

export type RecipientModal = {
  show: boolean;
  activeTab: string;
};