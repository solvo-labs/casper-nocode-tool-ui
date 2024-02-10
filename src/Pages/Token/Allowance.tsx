import React, { useEffect, useMemo, useState } from "react";
import { ERC20Token } from "../../utils/types";
import { Grid, Stack, Theme, CircularProgress, MenuItem, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import toastr from "toastr";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { SERVER_API, listofCreatorERC20Tokens } from "../../utils/api";

import { SelectChangeEvent } from "@mui/material/Select";
import { CustomSelect } from "../../components/CustomSelect";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";

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

const Allowance: React.FC = () => {
  const [receipentPubkey, setReceipentPubkey] = useState<string>("");
  const [tokens, setTokens] = useState<ERC20Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<ERC20Token>();

  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const classes = useStyles();
  const navigate = useNavigate();

  const disable = useMemo(() => {
    return receipentPubkey === "" || selectedToken === undefined;
  }, [receipentPubkey, selectedToken]);

  useEffect(() => {
    const init = async () => {
      listofCreatorERC20Tokens(publicKey)
        .then((result) => {
          setTokens(result);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const allowance = async () => {
    if (selectedToken) {
      const contract = new Contracts.Contract();
      contract.setContractHash(selectedToken.contractHash);

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        owner: CLValueBuilder.key(ownerPublicKey),
        recipient: CLValueBuilder.key(CLPublicKey.fromHex(receipentPubkey)),
      });

      const deploy = contract.callEntrypoint("allowance", args, ownerPublicKey, "casper-test", "1000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Allowance created successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-tokens");
        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      toastr.error("Please Select a token for allowance");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "60vh",
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

  return (
    <>
      {tokens.length <= 0 && <CreatorRouter explain={DONT_HAVE_ANYTHING.TOKEN} handleOnClick={() => navigate("/token")}></CreatorRouter>}
      {tokens.length > 0 && (
        <div
          style={{
            // height: "calc(100vh-5rem)",
            // minWidth: "21rem",
            padding: "1rem",
          }}
        >
          <Grid container className={classes.container}>
            <Grid container className={classes.center}>
              <Grid item>
                <Typography className={classes.title} variant="h5">
                  Allowance Token
                </Typography>
              </Grid>
              <Grid container className={classes.gridContainer}>
                <Stack spacing={4} direction={"column"} marginTop={4} className={classes.stackContainer}>
                  <CustomSelect
                    value={selectedToken?.contractHash || "default"}
                    label="ERC-20 Token"
                    onChange={(event: SelectChangeEvent) => {
                      const data = tokens.find((tk) => tk.contractHash === event.target.value);
                      setSelectedToken(data);
                    }}
                    id={"custom-select"}
                  >
                    <MenuItem value="default">
                      <em>Select an ERC-20 Token</em>
                    </MenuItem>
                    {tokens.map((tk) => {
                      return (
                        <MenuItem key={tk.contractHash} value={tk.contractHash}>
                          {tk.name + "(" + tk.symbol + ")"}
                        </MenuItem>
                      );
                    })}
                  </CustomSelect>
                  <CustomInput
                    placeholder="Receipt Pubkey"
                    label="Receipt Pubkey"
                    id="receiptPubkey"
                    name="receiptPubkey"
                    type="text"
                    value={receipentPubkey}
                    onChange={(e: any) => setReceipentPubkey(e.target.value)}
                  />

                  <Grid paddingTop={"2rem"} container justifyContent={"center"}>
                    <CustomButton onClick={allowance} disabled={disable} label="Allowance" />
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
};

export default Allowance;
