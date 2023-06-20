import React, { Children, cloneElement } from "react";
import { Select } from "@mui/material";
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
  value?: any;
  label?: string;
  children?: any;
};

export const CustomSelect: React.FC<Props> = ({ onChange, value, children, id, label }) => {
  const classes = useStyles();

  return (
    <Select
      classes={{ select: classes.select }}
      sx={{
        "& .css-jedpe8-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select": {
          height: "27px",
          borderRadius: "1rem",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: "1rem",
          //TODO: for just clicked
          //border: "0.1rem solid #FF0011 !important",
          border: "0.1rem solid #0F1429 !important",
        },
      }}
      onChange={onChange}
      value={value}
      variant="outlined"
      size="small"
      fullWidth
      id={id}
      label={label}
    >
      {Children.map(children, (child) => {
        return cloneElement(child, {
          classes: { root: child.props.value === value ? classes.selectedMenuItem : "" },
        });
      })}
    </Select>
  );
};
