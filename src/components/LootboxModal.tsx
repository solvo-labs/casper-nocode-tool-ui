import { Box, CircularProgress, Grid, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LootboxData, NFT } from "../utils/types";
import { NftCard } from "./NftCard";
import { getLootboxItem } from "../utils/api";

const style = {
  position: "absolute" as "absolute",
  transform: "translate(-50%, -50%)",
  width: 960,
  height: 720,
  top: "50%",
  left: "50%",
  overflow: "auto",
  backgroundColor: "#0F1429",
  border: "2px solid red",
  borderRadius: "12px",
  p: 4,
};

type Props = {
  open: boolean;
  lootbox: LootboxData;
  handleClose: () => void;
};

const LootboxModal: React.FC<Props> = ({ open, lootbox, handleClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const data = [];

      for (let index = 0; index < lootbox.deposited_item_count; index++) {
        const result = await getLootboxItem(lootbox.key, index);

        data.push(result);
      }

      setItems(data);
      setLoading(false);
    };

    init();
  }, []);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
        <Grid container direction={"column"} gap={1}>
          <Typography variant="h5">
            Lootbox <b>{lootbox.name}</b>
          </Typography>
          <Typography variant="subtitle1">
            Collection <b>{lootbox.nft_collection}</b>
          </Typography>
          <Typography variant="subtitle1"></Typography>
        </Grid>
        <Grid container marginTop={"2rem"}>
          {loading && (
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
          )}
          {/* {!loading &&
            nfts.map((nft: any, index: number) => (
              <Grid item md={4} key={index}>
                <NftCard key={index} asset={nft.asset} description={nft.desciption} index={index} name={nft.name} onClick={() => handleChangeIndex(index)}></NftCard>
              </Grid>
            ))} */}
        </Grid>
        {/* <Grid item display={"flex"} justifyContent={"center"} marginTop={"2rem"}>
          <CustomButton disabled={disable} label="Add Item" onClick={addItem}></CustomButton>
        </Grid> */}
      </Box>
    </Modal>
  );
};

export default LootboxModal;
