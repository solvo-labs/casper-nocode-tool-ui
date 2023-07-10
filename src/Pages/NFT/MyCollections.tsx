import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchCep78NamedKeys } from "../../utils/api";

export const MyCollections = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const data = await fetchCep78NamedKeys(ownerPublicKey);

      console.log(data);
    };

    init();
  }, []);

  return <span>My Collections Page</span>;
};
