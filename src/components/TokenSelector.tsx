import React from "react";
import { FormControl, InputLabel, MenuItem, SelectChangeEvent } from "@mui/material";
import { Token } from "../utils/api";
import { CustomSelect } from "./CustomSelect";

type Props = {
  tokens: Token[];
  selectedToken: Token | undefined;
  setSelectedToken: (param: Token) => void;
};

const TokenSelector: React.FC<Props> = ({ tokens, selectedToken, setSelectedToken }) => {
  return (
    <FormControl fullWidth>
      <InputLabel
        id="selectLabel"
        style={{
          color: "#fff",
          backgroundColor: "#FF3341",
          borderRadius: "4px",
        }}
      >
        Select a Token
      </InputLabel>
      <CustomSelect
        value={selectedToken?.contractHash || ""}
        label=" Token"
        onChange={(e: SelectChangeEvent<string>) => {
          const token = tokens.find((tkn: Token) => tkn.contractHash === e.target.value);
          if (token != undefined) {
            setSelectedToken(token);
          }
        }}
        id={"custom-select"}
      >
        {tokens.map((tk: Token) => {
          return (
            <MenuItem key={tk.contractHash} value={tk.contractHash}>
              {tk.name + "(" + tk.symbol + ")"}
            </MenuItem>
          );
        })}
      </CustomSelect>
    </FormControl>
  );
};

export default TokenSelector;
