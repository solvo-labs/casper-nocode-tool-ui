import React, { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, FormControl, Grid, Stack, TextField, Theme, Typography } from "@mui/material";

import { makeStyles } from "@mui/styles";
import { CustomSelect } from "../../components/CustomSelect";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { getValidators } from "../../utils/api";
import toastr from "toastr";

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
  const [selectedValidator, setSelectedValidator] = useState<any>();

  useEffect(() => {
    getValidators()
      .then((data) => {
        setValidators(data);
      })
      .catch((err) => {
        toastr.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
  console.log(validators[0]);

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
                options={validators.map((vl) => {
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
                  };
                })}
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

              <FormControl fullWidth margin="dense">
                <Grid item>
                  <CustomButton onClick={() => {}} disabled={!amount || amount <= 499} label="Delegate" fullWidth />
                </Grid>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
