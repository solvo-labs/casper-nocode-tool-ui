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
