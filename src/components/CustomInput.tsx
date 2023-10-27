import React from "react";
import { TextField, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    maxHeight: "44px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "300px",
    },
    "& input.Mui-disabled": {
      border: "1px solid gray",
      borderRadius: "16px",
      WebkitTextFillColor: "gray",
      labelColor: "gray",
    },
    "& .MuiInputLabel-root.Mui-disabled": { color: "gray" },
    "& .MuiInputLabel-root": {
      color: "white",
    },
  },
  light: {
    "& .MuiInputLabel-root": {
      color: "white",
    },
  },
  dark: {
    "& .MuiInputLabel-root": {
      color: "white",
      "&.Mui-disabled": {
        color: "gray",
      },
    },
    "& .MuiInputBase-input": {
      "&.Mui-disabled": {
        WebkitTextFillColor: "gray",
      },
    },
    "& .MuiFormLabel-root-MuiInputLabel-root": {
      "&.Mui-disabled": {
        color: "gray !important",
      },
    },
  },
}));

type Props = {
  placeholder: string;
  label: string;
  id?: string;
  name: string;
  type: string;
  value: string | number;
  onChange: any;
  disable?: boolean;
  required?: boolean;
  floor?: "light" | "dark";
};

export const CustomInput: React.FC<Props> = ({ placeholder, label, id, name, type, value, onChange, disable = false, required }) => {
  const classes = useStyles();

  return (
    <TextField
      className={(classes.input, classes.light)}
      sx={{
        color: "white !important",
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#FF0011",
        },
        "& .css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input": {
          color: "white",
        },
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
      required={required}
      type={type}
      fullWidth
      disabled={disable}
    />
  );
};
