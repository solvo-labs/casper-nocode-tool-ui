import React from "react";
import { MenuItem, SelectChangeEvent } from "@mui/material";
import { CustomSelect } from "./CustomSelect";
import { Token } from "../utils/types";

type Props = {
  tokens: Token[];
  selectedToken: Token | undefined;
  setSelectedToken: (param: Token) => void;
};

const TokenSelector: React.FC<Props> = ({ tokens, selectedToken, setSelectedToken }) => {
  return (
    <CustomSelect
      value={selectedToken?.contractHash || "default"}
      // label="Select a Token"
      onChange={(e: SelectChangeEvent<string>) => {
        const token = tokens.find((tkn: Token) => tkn.contractHash === e.target.value);
        if (token != undefined) {
          setSelectedToken(token);
        }
      }}
      id={"custom-select"}
    >
      <MenuItem value={"default"}>Select a Token</MenuItem>
      {tokens.map((tk: Token) => {
        return (
          <MenuItem key={tk.contractHash} value={tk.contractHash}>
            {tk.name + "(" + tk.symbol + ")"}
          </MenuItem>
        );
      })}
    </CustomSelect>
  );
};

export default TokenSelector;
