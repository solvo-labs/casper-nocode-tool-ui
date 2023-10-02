import {
  BurnMode,
  MetadataMutability,
  MintingMode,
  NFTHolderMode,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  NFTOwnershipMode,
  NamedKeyConventionMode,
  OwnerReverseLookupMode,
  WhiteListMode,
} from "./enum";

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
  mintingMode?: MintingMode;
  burnMode?: BurnMode;
  holderMode?: NFTHolderMode;
  namedKeyConventionMode?: NamedKeyConventionMode;
  ownerReverseLookupMode?: OwnerReverseLookupMode;
};

export type NFT = {
  contractHash: string;
  tokenMetaData: {
    name: string;
    description: string;
    imageURL: string;
  };
  mergable?: boolean;
  timeable?: boolean;
};

export type CollectionMetada = {
  name: string;
  symbol: string;
  contractHash: string;
  json_schema: {
    name: string;
    description: string;
    imageURL: string;
  };
};

export type Marketplace = {
  contractHash: string;
  contractName: string;
  feeWallet: string;
  listingCount: number;
};

export type Listing = {
  marketplace: string;
  collection_hash: string;
  price: number;
  tokenId: number;
  nftName: string;
  nftDescription: string;
  nftImage: string;
  listingIndex: number;
  createdAt?: string;
  active?: boolean;
};

export type Raffle = {
  name: string;
  collectionHash: string;
  nftIndex: number;
  start: number;
  end: number;
  price: number;
};

export type RaffleNamedKeys = {
  key: string;
  name: string;
};

export type RaffleMetadata = {
  key: string;
  collection: string;
  nft_index: NumberMeta;
  owner: string;
  name: string;
  start_date: NumberMeta;
  end_date: NumberMeta;
  price: NumberMeta;
};

export type NumberMeta = { hex: string; isBigNumber: boolean };
