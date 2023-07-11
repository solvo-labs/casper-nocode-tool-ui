import React, { useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import toastr from "toastr";

export const CreateCollection = () => {
  const [collectionData, setCollectionData] = useState();
  const [publicKey, provider, wasm, nftWasm] = useOutletContext<[publickey: string, provider: any, wasm: any, nftWasm: any]>();
  const navigate = useNavigate();

  const mintCollection = async () => {
    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      // contract
      const contract = new Contracts.Contract();

      const args = RuntimeArgs.fromMap({
        collection_name: CLValueBuilder.string("cl_3"),
        collection_symbol: CLValueBuilder.string("cl_3"),
        total_token_supply: CLValueBuilder.u64(1000),
        ownership_mode: CLValueBuilder.u8(2),
        nft_kind: CLValueBuilder.u8(1),
        nft_metadata_kind: CLValueBuilder.u8(2),
        whitelist_mode: CLValueBuilder.u8(0),
        identifier_mode: CLValueBuilder.u8(0),
        metadata_mutability: CLValueBuilder.u8(1),
        json_schema: CLValueBuilder.string(
          JSON.stringify({
            properties: {
              name: { name: "name", description: "", required: true },
              description: { name: "description", description: "", required: true },
              asset: { name: "asset", description: "", required: true },
            },
          })
        ),
        minting_mode: CLValueBuilder.u8(0),
        burn_mode: CLValueBuilder.u8(0),
        holder_mode: CLValueBuilder.u8(2),
        named_key_convention: CLValueBuilder.u8(0),
        owner_reverse_lookup_mode: CLValueBuilder.u8(0),
      });

      const deploy = contract.install(new Uint8Array(nftWasm!), args, "300000000000", ownerPublicKey, "casper-test");

      const deployJson = DeployUtil.deployToJson(deploy);
      // signer logic
      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, { headers: { "Content-Type": "application/json" } });
        toastr.success(response.data, "ERC-20 Token deployed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-tokens");
        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {}
  };

  return (
    <div>
      <button onClick={mintCollection}>Create Collection</button>
      <br />
      <span>Create Collection Page</span>
    </div>
  );
};
