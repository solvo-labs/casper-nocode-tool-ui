export enum APP_NAME {
  CASPER = "CASPER NOCODE TOOL",
}

export enum STAKE_PAGE {
  STAKTE_CASPER = "Stake Casper",
  STAKE_TOKEN = "Create CEP-18 Stake Pool",
  MANAGE_STAKE = "Manage Your CEP-18 Token Pools",
  JOIN_STAKES = "Stake CEP-18 Token",
}

export enum PAGES_NAME {
  STAKE = "STAKE",
  DAO = "DAO",
  NFT = "NFT",
  RAFFLE = "RAFFLE",
  TOKEN = "TOKEN",
  TOKENOMICS = "TOKENOMICS",
  MARKETPLACE = "MARKETPLACE",
}

export enum TOKEN_PAGE {
  TOKEN_MINT = "Token Deploy",
  MY_TOKENS = "My Tokens",
  TRANSFER = "Transfer",
  APPROVE = "Approve",
  MINT_AND_BURN = "Mint & Burn",
  ALLOWANCE = "Allowance",
  INCREASE_DECREASE_ALLOWANCE = "Increase & Decrease Allowance",
  TRANSFER_FROM = "Transfer From",
}

export enum TOKENOMICS_PAGE {
  CREATE_TOKENOMICS = "Create Tokenomics",
  MANAGE_TOKENOMICS = "Manage Tokenomics",
}

export enum NFT_PAGE {
  MY_COLLECTIONS = "My Collections",
  CREATE_NFT = "Create NFT",
  CREATE_COLLECTION = "Create Collection",
  APPROVE_NFT = "Approve Nft",
  CREATE_LOOTBOX = "Create Lootbox",
  MY_LOOTBOXES = "My Lootboxes",
  MERGE_NFT = "Merge NFT",
  TIMEABLE_NFTS = "Timeable NFT's",
}

export enum RAFFLE_PAGE {
  MANAGE_RAFFLE = "Manage Raffle",
  // CLAIM_RAFFLE = "Claim Raffle",
}

export enum MARKETPLACE_PAGE {
  LIST_MARKETPLACE = "List My Own Marketplace",
  CREATE_MARKETPLACE = "Create Marketplace",
  BUY_NFT = "Buy Nft",
  BUY_LOOTBOX = "Buy Lootbox",
  JOIN_RAFFLE = "Join Raffle",
}

export enum WALLETS_NAME {
  CASPER_WALLET = "CASPER WALLET",
}

export enum MY_ERC20TOKEN {
  NAME = "NAME",
  SYMBOL = "SYMBOL",
  DECIMAL = "DECIMAL",
  TOTAL_SUPPLY = "TOTAL SUPPLY",
  ENABLE_MINT_BURN = "ENABLE MINT BURN",
  BALANCE = "BALANCE",
}

export enum NamedKeyConventionMode {
  DerivedFromCollectionName,
  V1_0Standard,
  V1_0Custom,
}

export enum NFTOwnershipMode {
  Minter,
  Assigned,
  Transferable,
}

export enum NFTMetadataKind {
  CEP78,
  NFT721,
  Raw,
  CustomValidated,
}

export enum NFTKind {
  Physical,
  Digital,
  Virtual,
}

export enum MetadataMutability {
  Immutable,
  Mutable,
}

export enum MintingMode {
  Installer,
  Public,
}

export enum BurnMode {
  Burnable,
  NonBurnable,
}

export enum WhiteListMode {
  Unlocked,
  Locked,
}

export enum NFTIdentifierMode {
  Ordinal,
  Hash,
}

export enum OwnerReverseLookupMode {
  NoLookup,
  Complate,
  TransfersOnly,
}

export enum NFTHolderMode {
  Accounts,
  Contracts,
  Mixed,
}

export enum FETCH_IMAGE_TYPE {
  COLLECTION,
  NFT,
}

export enum DONT_HAVE_ANYTHING {
  TOKEN = "You don't have any Token",
  MARKETPLACE = "Couldn't find the marketplace to be displayed.",
  COLLECTION = "You don't own any collection.",
  NFT = "You don't have an NFT belonging to the collection.",
  LOOTBOX = "You don't own any lootbox.",
  APPROVE = "You don't have any Collections.",
  TIMEABLE_NFTS = "You don't have any Timable NFTs",
}

export enum RarityLevel {
  Common,
  Rare,
  Legendary,
}

export enum NFT_TYPES {
  Standart,
  Mergeable,
  Timeable,
}

export enum DURATION {
  "Yearly" = 31536000000,
  "Semi Annual" = 15768000000,
  "Quarterly" = 7884000000,
  "Four Month" = 10512000000,
  "Monthly" = 2628000000,
  "Weekly" = 604800000,
}

export enum PERIOD {
  "Minute" = 60000,
  "Hour" = 3600000,
  "Day" = 86400000,
  "Week" = 604800000,
  "Month" = 2629800000,
  "Year" = 31557600000,
}

export enum STAKE_STATUS {
  FAIL,
  WAITING_NOTIFY,
  WAITING_START_STAKE,
  STAKEABLE,
  WAITING_LOCK_PERIOD,
  UNSTAKEBLE,
  FINISHED,
}
