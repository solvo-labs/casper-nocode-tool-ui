import React, { Children, cloneElement } from "react";
import { FormControl, InputLabel, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  select: {
    color: "white !important",
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
    backgroundColor: "#FF3341 !important",
    width: "100% !important",
  },
  selectedMenuItem: {
    backgroundColor: "#FF3341 !important",
    color: "white !important",
  },
}));

type Props = {
  id: string;
  onChange: any;
  titlePosition?: any;
  titleTop?: any;
  value?: any;
  label?: string;
  children?: any;
  disabled?: boolean;
};

export const CustomSelect: React.FC<Props> = ({ onChange, value, children, id, label, disabled = false, titlePosition = "absolute", titleTop = "0px" }) => {
  const classes = useStyles();

  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          top: titleTop,
          color: " white",
          position: titlePosition,
          "&.Mui-focused": {
            color: "red",
          },
        }}
      >
        {label}
      </InputLabel>
      <Select
        classes={{ select: classes.select }}
        sx={{
          color: "white",
          ".MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          ".MuiSvgIcon-root ": {
            fill: "white !important",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            //TODO: for just clicked
            //border: "0.1rem solid #FF0011 !important",
            border: "0.1rem solid #0F1429 !important",
          },
        }}
        onChange={onChange}
        value={value}
        variant="outlined"
        fullWidth
        id={id}
        label={label}
        disabled={disabled}
      >
        {Children.map(children, (child) => {
          return cloneElement(child, {
            classes: { root: child.props.value === value ? classes.selectedMenuItem : "" },
          });
        })}
      </Select>
    </FormControl>
  );
};
