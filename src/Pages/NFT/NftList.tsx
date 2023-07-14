import React, { useEffect } from "react";
import { getNftCollection, getNftMetadata } from "../../utils/api";

export const NftList = () => {
  useEffect(() => {
    const init = async () => {
      const mockedNftCollection = "hash-5480fd53270a9768dc9c37ac41921a583d7f19095479f89552cda74185cca66c";

      const nftCollection = await getNftCollection(mockedNftCollection);
      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(mockedNftCollection, index.toString()));
      }

      const nftMetas = await Promise.all(promises);

      console.log(nftMetas);
    };

    init();
  }, []);

  return <span>Nft List Page</span>;
};
