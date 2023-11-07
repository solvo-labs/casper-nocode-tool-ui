import React, { useEffect, useState } from "react";
import { getAllLootboxes } from "../../utils/api";
import { lootboxStorageContract } from "../../utils";
import { CircularProgress } from "@mui/material";
import { LootboxData } from "../../utils/types";

export const LootboxList = () => {
  const [loading, setLoding] = useState<boolean>(true);
  const [lootboxes, setLootboxes] = useState<LootboxData[]>([]);

  useEffect(() => {
    const init = async () => {
      const data = await getAllLootboxes(lootboxStorageContract);
      setLootboxes(data);

      setLoding(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return <div>Lootbox list</div>;
};
