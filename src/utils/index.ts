import { fetchIPFSImage } from "./api";
import { FETCH_IMAGE_TYPE } from "./enum";
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

export const getMetadataImage = async (metadata: any, type: FETCH_IMAGE_TYPE) => {
  try {
    let imageLink: string = "images/casper.png";

    if (type == FETCH_IMAGE_TYPE.COLLECTION) {
      const parsedData = JSON.parse(metadata);
      if (parsedData.imageURL && parsedData.imageURL.startsWith("https://ipfs.io/ipfs/")) {
        const result = await fetchIPFSImage(parsedData.imageURL);
        imageLink = result;
      }
    }

    if (type == FETCH_IMAGE_TYPE.NFT) {
      if (metadata.imageURL && metadata.imageURL.startsWith("https://ipfs.io/ipfs/")) {
        const result = await fetchIPFSImage(metadata.imageURL);
        imageLink = result;
      }
    }

    return imageLink;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return "images/casper.png";
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

export const uit32ArrayToHex = (data: any) => {
  return Object.values(data)
    .map((byte: any) => byte.toString(16).padStart(2, "0"))
    .join("");
};
