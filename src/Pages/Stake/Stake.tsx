import { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, FormControl, Grid, IconButton, List, ListItem, ListItemText, Stack, TextField, Theme, Typography } from "@mui/material";

import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { SERVER_API, getValidators } from "../../utils/api";
import toastr from "toastr";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder, CLPublicKeyTag } from "casper-js-sdk";
import { useOutletContext } from "react-router-dom";
import axios from "axios";

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
    minWidth: "50rem",
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

export const Stake = () => {
  const classes = useStyles();
  const [amount, setAmount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [validators, setValidators] = useState<any[]>([]);
  const [delegations, setDelegations] = useState<any[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<any>();
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  useEffect(() => {
    getValidators()
      .then((data) => {
        const filteredData = data.filter((dt: any) => dt.bid.delegators.length < 1200);
        setValidators(filteredData);

        let myActiveDelegations: any[] = [];

        for (let dt of data) {
          const delegators = dt.bid.delegators;

          const findMe = delegators.filter((dl: any) => dl.public_key === publicKey);

          if (findMe.length > 0) {
            myActiveDelegations = [...myActiveDelegations, ...findMe];
          }
        }

        setDelegations(myActiveDelegations);
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const stake = async () => {
    try {
      if (amount) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        contract.setContractHash("hash-93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2");
        console.log(selectedValidator.public_key);
        // parameters
        const args = RuntimeArgs.fromMap({
          validator: CLValueBuilder.publicKey(Buffer.from(selectedValidator.public_key.substring(2), "hex"), CLPublicKeyTag.ED25519),
          amount: CLValueBuilder.u512(amount * 1000000000),
          delegator: CLValueBuilder.publicKey(Buffer.from(publicKey.substring(2), "hex"), CLPublicKeyTag.SECP256K1),
        });

        const deploy = contract.callEntrypoint("delegate", args, ownerPublicKey, "casper-test", "2500000000");

        const deployJson = DeployUtil.deployToJson(deploy);
        console.log("deployJson", deployJson);

        // signer logic
        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          console.log("sign", sign);

          setLoading(true);

          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          console.log("signedDeploy", signedDeploy);

          const data = DeployUtil.deployToJson(signedDeploy.val);

          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });
          toastr.success(response.data, "Delegate created successfully.");
          window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

          setLoading(false);
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (err: any) {
      toastr.error(err);
    }
  };

  const unStake = async (value: any) => {
    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const contract = new Contracts.Contract();

      contract.setContractHash("hash-93d923e336b20a4c4ca14d592b60e5bd3fe330775618290104f9beb326db7ae2");

      // parameters
      const args = RuntimeArgs.fromMap({
        validator: CLValueBuilder.publicKey(Buffer.from(value.delegatee.substring(2), "hex"), CLPublicKeyTag.ED25519),
        amount: CLValueBuilder.u512(value.staked_amount),
        delegator: CLValueBuilder.publicKey(Buffer.from(publicKey.substring(2), "hex"), CLPublicKeyTag.SECP256K1),
      });

      const deploy = contract.callEntrypoint("undelegate", args, ownerPublicKey, "casper-test", "2500000000");

      const deployJson = DeployUtil.deployToJson(deploy);
      console.log("deployJson", deployJson);

      // signer logic
      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        console.log("sign", sign);

        setLoading(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        console.log("signedDeploy", signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Unstake completed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        setLoading(false);
      } catch (error: any) {
        alert(error.message);
      }
    } catch (err: any) {
      toastr.error(err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
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
    <div
      style={{
        height: "calc(100vh-5rem)",
        minWidth: "21rem",
        padding: "1rem",
      }}
    >
      <Grid container className={classes.container}>
        <Grid container className={classes.center}>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              STAKE MANAGEMENT
            </Typography>
          </Grid>
          <Grid container className={classes.gridContainer}>
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={validators.map((vl, index) => {
                  const pubkey: string = vl.public_key;
                  return {
                    label:
                      pubkey.substring(0, 20) +
                      "..." +
                      pubkey.substring(pubkey.length - 10) +
                      "" +
                      ", Fee : " +
                      vl.bid.delegation_rate +
                      "%" +
                      "(" +
                      vl.bid.delegators.length +
                      " delegator)" +
                      ", Stake Amount : " +
                      vl.bid.staked_amount / 1000000000 +
                      " CSPR",

                    value: index,
                  };
                })}
                onChange={(_event, value) => {
                  if (value) {
                    setSelectedValidator(validators[value.value]);
                  } else {
                    setSelectedValidator(undefined);
                  }
                }}
                sx={{ width: "100%", color: "white", border: "border 4px solid white !important" }}
                renderInput={(params) => <TextField {...params} label="Validator" />}
              />
              <CustomInput
                placeholder="Amount (min 500 CSPR)"
                label="Amount (CSPR)"
                id="amount"
                name="amount"
                type="number"
                value={amount || ""}
                onChange={(e: any) => setAmount(e.target.value)}
              />

              <FormControl fullWidth>
                <Grid item>
                  <CustomButton onClick={stake} disabled={!amount || amount <= 499} label="Delegate" fullWidth />
                </Grid>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>

        <Grid container className={classes.center} marginTop={"2rem"} marginBottom={"1rem"}>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              ACTIVE DELEGATIONS
            </Typography>
          </Grid>
        </Grid>
        <List sx={{ width: "100%", border: "1px solid red", borderRadius: "8px", marginTop: "1rem" }}>
          <>
            <ListItem dense>
              <ListItemText
                id="default"
                primary={
                  <>
                    <Typography sx={{ padding: "4px 8px", marginRight: "4rem" }}>Stake Pool</Typography>
                  </>
                }
              />
              <ListItemText
                id="default"
                primary={
                  <>
                    <Typography>Stake Amount</Typography>
                  </>
                }
              />
              <ListItemText
                id="default"
                primary={
                  <>
                    <Typography>Fee Rate</Typography>
                  </>
                }
              />
            </ListItem>
          </>
          {delegations.map((value, index) => {
            const labelId = `checkbox-list-label-${index}`;
            const delegationRate = validators.find((vl) => vl.public_key === value.delegatee).bid.delegation_rate;

            return (
              <ListItem
                key={value}
                secondaryAction={
                  <IconButton edge="end" aria-label="comments">
                    <CustomButton style={{ marginRight: "5px " }} onClick={() => unStake(value)} disabled={false} label="UnStake" fullWidth />
                    <CustomButton onClick={stake} disabled={false} label="Stake" fullWidth />
                  </IconButton>
                }
                style={{ padding: "0.5rem" }}
                disablePadding
              >
                <ListItem dense>
                  <ListItemText
                    id={labelId}
                    primary={
                      <>
                        <Typography sx={{ marginRight: "1rem" }}>{value.delegatee}</Typography>
                      </>
                    }
                  />
                </ListItem>
                <ListItem dense>
                  <ListItemText
                    id={labelId}
                    primary={
                      <>
                        <Typography>{value.staked_amount / 1000000000} CSPR</Typography>
                      </>
                    }
                  />
                </ListItem>
                <ListItem dense>
                  <ListItemText
                    id={labelId}
                    primary={
                      <>
                        <Typography>{delegationRate.toFixed(2)} %</Typography>
                      </>
                    }
                  />
                </ListItem>
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </div>
  );
};
