import { Card, CardContent, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import { CustomButton } from "./CustomButton";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingTop: "1rem !important",
    paddingBottom: "1rem !important",
  },
  title: {
    color: "white",
    fontWeight: "bold !important",
    fontSize: "1.2rem !important",
  },
}));

type Props = {
  title: string;
  handleClick: () => void;
};

const CreateSomething: React.FC<Props> = ({ title, handleClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container display={"flex"} direction={"column"} alignContent={"center"}>
          <Typography className={classes.title}>Do you want create a new {title}?</Typography>
          <Grid item marginTop={"2rem"} display={"flex"} justifyContent={"center"}>
            <CustomButton disabled={false} label={"Create " + title} onClick={handleClick}></CustomButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreateSomething;
