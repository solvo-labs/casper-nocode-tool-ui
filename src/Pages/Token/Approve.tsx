import React, { useEffect, useMemo, useState } from "react";
import { CircularProgress, Grid, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { Token, TokenApprove } from "../../utils/types";
import { useOutletContext, useNavigate } from "react-router-dom";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { SERVER_API, initTokens } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";
import { CustomSelect } from "../../components/CustomSelect";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";
import { tokenSupplyBN } from "../../utils";

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

const Approve: React.FC = () => {
  const [data, setData] = useState<TokenApprove>({
    spenderPubkey: "",
    amount: 0,
  });

  const classes = useStyles();

  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedToken, setSelectedToken] = useState<Token>();

  const navigate = useNavigate();

  const disable = useMemo(() => {
    return !selectedToken || !data.spenderPubkey || data.amount <= 0;
  }, [data, selectedToken]);

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();

      const { finalData } = await initTokens(accountHash, publicKey);

      const filteredFinalData = finalData.filter((fd) => fd.balance > 0);

      setTokens(filteredFinalData);

      setLoading(false);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const approve = async () => {
    if (selectedToken) {
      const contract = new Contracts.Contract();
      contract.setContractHash(selectedToken.contractHash);

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        spender: CLValueBuilder.key(CLPublicKey.fromHex(data.spenderPubkey)),
        amount: CLValueBuilder.u256(tokenSupplyBN(data.amount, selectedToken.decimals)),
      });

      const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "1000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", deployData, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, selectedToken.name + "Token approved successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-tokens");
      } catch (error: any) {
        toastr.error(error);
      }
    } else {
      toastr.error("Please Select a token for transfer");
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
                <Typography variant="h5" className={classes.title}>
                  Approve Token
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
                    placeholder="Spender Pubkey"
                    label="Spender Pubkey"
                    id="spenderPubkey"
                    name="spenderPubkey"
                    type="text"
                    value={data.spenderPubkey}
                    onChange={(e: any) =>
                      setData({
                        ...data,
                        spenderPubkey: e.target.value,
                      })
                    }
                  />
                  <CustomInput
                    placeholder="Amount"
                    label="Amount"
                    id="amount"
                    name="amount"
                    type="number"
                    value={data.amount}
                    onChange={(e: any) =>
                      setData({
                        ...data,
                        amount: e.target.value,
                      })
                    }
                  />
                  <Grid paddingTop={2} container justifyContent={"center"}>
                    <CustomButton onClick={approve} disabled={disable} label="Approve" />
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

export default Approve;
