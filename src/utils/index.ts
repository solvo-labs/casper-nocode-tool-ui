// @ts-ignore
import { CLValueBuilder } from "casper-js-sdk";

export const timestampToDate = (timestamp: number) => {
  const dateFormat = new Date(timestamp * 1000);
  const dayFormat = dateFormat.getDate().toString();
  const monthFormat = (dateFormat.getMonth() + 1).toString();
  const hourFormat = dateFormat.getHours().toString();
  const minutesFormat = dateFormat.getMinutes().toString();

  const formatter = (value: string): string => {
    value.length < 2 ? (value = 0 + "" + value) : value;
    return value;
  };
  const date = formatter(dayFormat) + "/" + formatter(monthFormat) + "/" + dateFormat.getFullYear() + " " + formatter(hourFormat) + ":" + formatter(minutesFormat);
  return timestamp == 0 ? "-" : date;
};

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

export class CasperHelpers {
  static stringToKey(string: string) {
    return CLValueBuilder.key(this.stringToKeyParameter(string));
  }

  static stringToKeyParameter(string: string) {
    return CLValueBuilder.byteArray(this.convertHashStrToHashBuff(string));
  }

  static convertHashStrToHashBuff(hashStr: string) {
    let hashHex = hashStr;
    if (hashStr.startsWith("hash-")) {
      hashHex = hashStr.slice(5);
    }
    return Buffer.from(hashHex, "hex");
  }
}

export const uint32ArrayToHex = (data: any) => {
  return Object.values(data)
    .map((byte: any) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const removeDuplicates = (arr: any[]) => {
  let unique: any = {};
  let result: any[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (!unique[arr[i]]) {
      result.push(arr[i]);
      unique[arr[i]] = 1;
    }
  }
  return result;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const STORE_RAFFLE_CONTRACT_HASH = "6cbf0ee026d1d6ebc0364308213ce859895278f73bb15744b5089f8335adb8c8";
export const lootboxStorageContract = "0e99476bb8b2cdade2f916bfaad7f844120bd0bb1d3ab170d7ab501b4fa850ba";
export const MERGABLE_NFT_CONTRACT = "0fd47c1f089cdec3be2e7d02080ea808712f8124826a97f43e51f9f33f87ca2d";

const rarityLevelExplanationTitleArray: string[] = [
  "COMMON: This level is given to the most frequently encountered items inside loot boxes. These items are generally common and widely found.",
  "RARE: This level is given to less common and more special items. These items are rarer within the general population and possess special value.",
  "LEGENDARY: This is the highest level, given to the rarest and most special items found in loot boxes. They are often of unique value and highly esteemed within the community.",
];
export const rarityLevelExplanationTitle = rarityLevelExplanationTitleArray.join("\n");

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const METADATA_MUTABILITY_EXPLANATION =
  "If you want to create Custom NFTs or Timable NFTs for your collection, it is necessary to select the metadata mutability mode as immutable.";
export const MINTING_MODE_EXPLANATION = "If you want to create Custom NFTs or Timable NFTs for your collection, it is necessary to select the minting mode as public.";
export const BURN_MODE_EXPLANATION = "If you want to create Custom NFTs or Timable NFTs for your collection, it is necessary to select the burn mode as burnable.";
export const OWNER_REVERSE_LOOKUP_MODE_EXPLANATION =
  "If you want your collection to have the Mergable feature, the Owner Reverse Lookup Mode must be either 'NoLookup' or 'TransfersOnly'. If you want it to be a Timable NFT, you should select the 'Complete' mode.";
