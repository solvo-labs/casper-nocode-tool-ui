import React, { useState } from "react";
import { Grid, Stack, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import { TokenApprove } from "../../utils/types";

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
}));

const Approve: React.FC = () => {
  const [data, setData] = useState<TokenApprove>({
    spenderPubkey: "",
    amount: 0,
  });

  const classes = useStyles();

  const approveData = () => {
    console.log("approve page: ", data);
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
          <h5 className={classes.title}>Approve Token</h5>

          <Grid container className={classes.gridContainer}>
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
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
                placeholder="Supply"
                label="Supply"
                id="supply"
                name="supply"
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
                <CustomButton onClick={approveData} disabled={false} label="Approve" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Approve;
