import React from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useOutletContext } from "react-router-dom";
import { SERVER_API } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";

export const CreateNft = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const createNft = async () => {
    const contract = new Contracts.Contract();
    contract.setContractHash("hash-5480fd53270a9768dc9c37ac41921a583d7f19095479f89552cda74185cca66c");

    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      token_owner: CLValueBuilder.key(ownerPublicKey),
      token_meta_data: CLValueBuilder.string(
        JSON.stringify({ name: "Kaaacca2", description: "hello", asset: "https://maritime.sealstorage.io/ipfs/bafkreia2xhh4rh5tmlpy5srlzzezvm2nabm7rcvuhtjexhj5hh42yidiku" })
      ),
    });

    const deploy = contract.callEntrypoint("mint", args, ownerPublicKey, "casper-test", "2000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      // setActionLoader(true);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const deployData = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", deployData, { headers: { "Content-Type": "application/json" } });
      toastr.success(response.data, "Mint completed successfully.");
      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

      // navigate("/my-tokens");
      // setActionLoader(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      <button onClick={createNft}>Create Nft</button>
    </div>
  );
};
