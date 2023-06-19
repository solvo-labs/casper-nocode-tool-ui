import React, { useEffect, useState } from "react";
import { CustomSelect } from "../components/CustomSelect";
import { MenuItem } from "@mui/material";

enum selectValues {
  MENU_1 = "menu 1",
  MENU_2 = "menu 2",
  MENU_3 = "menu 3",
  MENU_4 = "menu 4",
}

const Main: React.FC = () => {
  const [value, setValue] = useState<selectValues>(selectValues.MENU_1);

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <div
      style={{
        height: "calc(100vh - 8rem)",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CustomSelect
        id="select"
        onChange={(event: any) => {
          setValue(event.target.value);
        }}
        value={value}
      >
        <MenuItem value={selectValues.MENU_1}>{selectValues.MENU_1}</MenuItem>
        <MenuItem value={selectValues.MENU_2}>{selectValues.MENU_2}</MenuItem>
        <MenuItem value={selectValues.MENU_3}>{selectValues.MENU_3}</MenuItem>
        <MenuItem value={selectValues.MENU_4}>{selectValues.MENU_4}</MenuItem>
      </CustomSelect>
    </div>
  );
};

export default Main;
