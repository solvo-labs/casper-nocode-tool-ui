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
      <span>We integrated only Token pages.</span>
    </div>
  );
};

export default Main;
