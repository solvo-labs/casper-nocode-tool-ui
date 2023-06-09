import { Grid, Stack, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import { CustomInput } from "../components/CustomInput";
import { Token } from "../utils/types";
import { CustomButton } from "../components/CustomButton";

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

const TokenMint: React.FC = () => {
  const [data, setData] = useState<Token>({
    name: "",
    symbol: "",
    decimal: 9,
    supply: 0,
    description: "",
  });

  const classes = useStyles();

  const mintToken = () => {
    setData({
      name: "",
      symbol: "",
      decimal: 9,
      supply: 0,
      description: "",
    });
    console.log(data);
  };

  const disable = !(data.name && data.symbol && data.supply && data.decimal && data.description);

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
          <h5 className={classes.title}>Generate Token</h5>

          <Grid container className={classes.gridContainer}>
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <CustomInput
                placeholder="Name"
                label="Name"
                id="name"
                name="name"
                type="text"
                value={data.name}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    name: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Description"
                label="Description"
                id="description"
                name="description"
                type="text"
                value={data.description}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    description: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Symbol"
                label="Symbol"
                id="symbol"
                name="symbol"
                type="text"
                value={data.symbol}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    symbol: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Supply"
                label="Supply"
                id="supply"
                name="supply"
                type="number"
                value={data.supply}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    supply: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Decimal"
                label="Decimal"
                id="decimal"
                name="decimal"
                type="number"
                value={data.decimal}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    decimal: e.target.value,
                  })
                }
              />
              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={mintToken} disabled={disable} label="Mint Token" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default TokenMint;
