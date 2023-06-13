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
