import { collectionImage } from "./api";

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

export const getMetadataImage = async (metadata: any) => {
  try {
    let imageLink: string;
    const parsedData = JSON.parse(metadata.json_schema);
    if (parsedData.imageURL && parsedData.imageURL.startsWith("https://ipfs.io/ipfs/")) {
      const result = await collectionImage(parsedData.imageURL);
      imageLink = result;
      return result;
    } else {
      imageLink = "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";
    }
    return Promise.resolve(imageLink);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";
  }
};
