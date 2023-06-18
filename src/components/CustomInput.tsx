import React from "react";
import { TextField, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    maxHeight: "44px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "300px",
    },
  },
}));

type Props = {
  placeholder: string;
  label: string;
  id: string;
  name: string;
  type: string;
  value: string | number;
  onChange: any;
};

export const CustomInput: React.FC<Props> = ({ placeholder, label, id, name, type, value, onChange }) => {
  const classes = useStyles();

  return (
    <TextField
      className={classes.input}
      sx={{
        input: {
          color: "#FFFFFF",
        },
        label: {
          color: "#FFFFFF",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#FF0011",
        },
        "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {},
        "& .css-14s5rfu-MuiFormLabel-root-MuiInputLabel-root": {
          transform: "translate(14px, 12px) scale(1)",
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderRadius: "1rem",
            border: "1px solid #BFBFBF",
          },
          "&:hover fieldset": {
            borderColor: "#FF0011",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#FF0011",
          },
        },
      }}
      placeholder={placeholder}
      id={id}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      required
      type={type}
      fullWidth
    />
  );
};
