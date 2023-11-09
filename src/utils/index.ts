// @ts-ignore
import { CLValueBuilder } from "casper-js-sdk";

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

export const lootboxStorageContract = "ea046dfb169168f011dd692ce9d7143b798d5728ea4fc7adc4d170d41e50f4ab";
const rarityLevelExplanationTitleArray: string[] = [
  "COMMON: This level is given to the most frequently encountered items inside loot boxes. These items are generally common and widely found.",
  "RARE: This level is given to less common and more special items. These items are rarer within the general population and possess special value.",
  "LEGENDARY: This is the highest level, given to the rarest and most special items found in loot boxes. They are often of unique value and highly esteemed within the community.",
];
export const rarityLevelExplanationTitle = rarityLevelExplanationTitleArray.join("\n");
export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
