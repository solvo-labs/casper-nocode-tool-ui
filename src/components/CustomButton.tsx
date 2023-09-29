import React from "react";
import { Button, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    padding: "10px",
    color: "#FFFFFF !important",
    borderRadius: "1rem",
    minWidth: "235px",
    minHeight: "44px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "200px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#FEBFC4 !important",
    },
    "&:not(.Mui-disabled)": {
      backgroundColor: "#FF0011",
      "&:hover": {
        backgroundColor: "#BF000C",
      },
    },
  },
  textButton: {
    padding: "10px",
    color: "#FFFFFF !important",
    borderRadius: "1rem",
    minWidth: "235px",
    minHeight: "44px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "200px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#FEBFC4 !important",
    },
    "&:not(.Mui-disabled)": {
      // backgroundColor: "#FF0011",
      "&:hover": {
        backgroundColor: "#FF0011",
      },
    },
  },
}));

type Props = {
  onClick: any;
  label: string;
  disabled: boolean;
  fullWidth?: boolean;
  style?: any;
};

export const CustomButton: React.FC<Props> = ({ onClick, label, disabled, fullWidth = false, style }) => {
  const classes = useStyles();

  return (
    <Button variant="contained" className={classes.button} onClick={onClick} disabled={disabled} fullWidth={fullWidth} style={style}>
      {label}
    </Button>
  );
};

export const CustomButtonText: React.FC<Props> = ({ onClick, label, disabled }) => {
  const classes = useStyles();
  return (
    <Button variant="text" className={classes.textButton} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
};
