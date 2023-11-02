export enum APP_NAME {
  CASPER = "CASPER NOCODE TOOL",
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
}

export enum RAFFLE_PAGE {
  MANAGE_RAFFLE = "Manage Raffle",
  CLAIM_RAFFLE = "Claim Raffle",
}

export enum MARKETPLACE_PAGE {
  LIST_MARKETPLACE = "List My Own Marketplace",
  CREATE_MARKETPLACE = "Create Marketplace",
  BUY_NFT = "Buy Nft",
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
  MARKETPLACE = "Couldn't find the marketplace to be displayed.",
  COLLECTION = "You don't own any collection.",
  NFT = "You don't have an NFT belonging to the collection.",
  LOOTBOX = "You don't own any lootbox.",
}
