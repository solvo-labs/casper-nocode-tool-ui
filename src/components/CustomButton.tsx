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
}));

type Props = {
  onClick: any;
  label: string;
  disabled: boolean;
};

export const CustomButton: React.FC<Props> = ({ onClick, label, disabled }) => {
  const classes = useStyles();

  return (
    <Button variant="contained" className={classes.button} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
};
