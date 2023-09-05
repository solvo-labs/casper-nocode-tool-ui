import React from "react";
import { Select } from "@mui/material";



export const NewCustomSelect: React.FC = () => {
    return (
        <Select 
        sx={{
            borderRadius: "1rem",
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
          }}>

        </Select>
    );
};
