import React, { useEffect } from "react";
import { getNftCollection, getNftMetadata } from "../../utils/api";
import { useParams } from "react-router-dom";

export const NftList = () => {
  const params = useParams();
  const nftCollectionHash = params.collectionHash;

  useEffect(() => {
    const init = async () => {
      if (nftCollectionHash) {
        const mockedNftCollection = nftCollectionHash;

        const nftCollection = await getNftCollection(mockedNftCollection);
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(mockedNftCollection, index.toString()));
        }

        const nftMetas = await Promise.all(promises);

        console.log(nftMetas);
      }
    };

    init();
  }, []);

  return <span>Nft List Page</span>;
};
