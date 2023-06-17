import React, { useEffect, useState } from "react";
import { ERC20Token, TokenTransfer } from "../../utils/types";
import { Grid, Stack, Theme, CircularProgress, MenuItem } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import toastr from "toastr";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { listofCreatorERC20Tokens } from "../../utils/api";

import Select, { SelectChangeEvent } from "@mui/material/Select";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down("sm")]: {
      marginBottom: 2,
      marginTop: 2,
      padding: "24px",
    },
  },
  center: {
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
  },
  title: {
    fontWeight: 500,
    fontSize: "26px",
    position: "relative",
    top: "3rem",
    borderBottom: "1px solid #FF0011 !important",
  },
  gridContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
    padding: "1rem",
  },
  stackContainer: {
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
  buttonContainer: {
    textAlign: "start",
    justifyContent: "space-between",
    alignItems: "center",
  },
  select: {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#FF0011",
    },
  },
}));

const MintAndBurn: React.FC = () => {
  const [data, setData] = useState<number>(0);
  const [tokens, setTokens] = useState<ERC20Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<ERC20Token>();

  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      listofCreatorERC20Tokens(ownerPublicKey.toAccountHashStr())
        .then((result) => {
          setTokens(result);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    init();
  }, []);

  const mint = async () => {
    if (selectedToken) {
      const contract = new Contracts.Contract();
      contract.setContractHash(selectedToken.contractHash);

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        owner: CLValueBuilder.key(ownerPublicKey),
        amount: CLValueBuilder.u256(Number(data * Math.pow(10, parseInt(selectedToken.decimals.hex, 16)))),
      });

      const deploy = contract.callEntrypoint("mint", args, ownerPublicKey, "casper-test", "1000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployedData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post("http://localhost:1923/deploy", deployedData, { headers: { "Content-Type": "application/json" } });
        toastr.success(response.data, selectedToken.name + " Token minted successfully.");

        navigate("/my-tokens");
        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      toastr.error("Please Select a token for transfer");
    }
  };

  const burn = async () => {
    if (selectedToken) {
      const contract = new Contracts.Contract();
      contract.setContractHash(selectedToken.contractHash);

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        owner: CLValueBuilder.key(ownerPublicKey),
        amount: CLValueBuilder.u256(Number(data * Math.pow(10, parseInt(selectedToken.decimals.hex, 16)))),
      });

      const deploy = contract.callEntrypoint("burn", args, ownerPublicKey, "casper-test", "1000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployedData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post("http://localhost:1923/deploy", deployedData, { headers: { "Content-Type": "application/json" } });
        toastr.success(response.data, selectedToken.name + " Token burned successfully.");

        navigate("/my-tokens");
        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      toastr.error("Please Select a token for transfer");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 8rem)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  const calculateSupply = () => {
    if (selectedToken) {
      return parseInt(selectedToken.total_supply.hex || "", 16) / Math.pow(10, parseInt(selectedToken.decimals.hex, 16));
    }

    return 0;
  };

  return (
    <div
      style={{
        height: "calc(100vh-5rem)",
        minWidth: "21rem",
        padding: "1rem",
      }}
    >
      <Grid container className={classes.container}>
        <Grid container className={classes.center}>
          <h5 className={classes.title}>Transfer Token</h5>

          <Grid container className={classes.gridContainer}>
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedToken?.contractHash || ""}
                label="ERC-20 Token"
                placeholder="Select ERC-20 Token"
                onChange={(event: SelectChangeEvent) => {
                  console.log(event.target);
                  const data = tokens.find((tk) => tk.contractHash === event.target.value);
                  setSelectedToken(data);
                }}
                className={classes.select}
                style={{ borderRadius: "1rem", height: "3rem", color: "white" }}
              >
                <MenuItem value="">
                  <em>Select an ERC20 Token</em>
                </MenuItem>
                {tokens.map((tk) => {
                  console.log("tk", tk);
                  return (
                    <MenuItem key={tk.contractHash} value={tk.contractHash}>
                      {tk.name + "(" + tk.symbol + ")"}
                    </MenuItem>
                  );
                })}
              </Select>
              {selectedToken && <span>Total Supply : {calculateSupply()}</span>}
              <CustomInput placeholder="Amount" label="Amount" id="amount" name="amount" type="number" value={data} onChange={(e: any) => setData(e.target.value)} />
              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={mint} disabled={data <= 0 || selectedToken === undefined} label="Mint" />
              </Grid>

              {selectedToken?.enable_mint_burn && (
                <Grid paddingTop={2} container justifyContent={"center"}>
                  <CustomButton onClick={burn} disabled={data <= 0 || data > calculateSupply() || selectedToken === undefined} label="Burn" />
                </Grid>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default MintAndBurn;
