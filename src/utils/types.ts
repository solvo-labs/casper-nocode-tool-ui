import { BurnMode, MetadataMutability, MintingMode, NFTHolderMode, NFTIdentifierMode, NFTKind, NFTMetadataKind, NFTOwnershipMode, NamedKeyConventionMode, OwnerReverseLookupMode, WhiteListMode } from "./enum";

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

export type Collection = {
  name: string;
  symbol: string;
  totalSupply: number;
  ownershipMode: NFTOwnershipMode;
  kind: NFTKind;
  nftMetadataKind: NFTMetadataKind;
  whiteListMode?: WhiteListMode;
  identifierMode: NFTIdentifierMode;
  metadataMutability?: MetadataMutability;
  jsonSchema?: object;
  mintingMode?: MintingMode;
  burnMode?: BurnMode;
  holderMode?: NFTHolderMode;
  namedKeyConventionMode?: NamedKeyConventionMode;
  ownerReverseLookupMode?: OwnerReverseLookupMode;
}

export type NFT = {
  contractHash: string;
  tokenMetaData: object;
}