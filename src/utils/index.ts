import { fetchIPFSImage } from "./api";
import { FETCH_IMAGE_TYPE } from "./enum";

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
    let imageLink: string =
      "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";

    if (type == FETCH_IMAGE_TYPE.COLLECTION) {
      const parsedData = JSON.parse(metadata);
      if (
        parsedData.imageURL &&
        parsedData.imageURL.startsWith("https://ipfs.io/ipfs/")
      ) {
        const result = await fetchIPFSImage(parsedData.imageURL);
        imageLink = result;
      }
    } else if (type == FETCH_IMAGE_TYPE.NFT) {
      if (
        metadata.imageURL &&
        metadata.imageURL.startsWith("https://ipfs.io/ipfs/")
      ) {
        const result = await fetchIPFSImage(metadata.imageURL);
        imageLink = result;
      }
    }
    return imageLink;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";
  }
};
