import { Box, Grid, Modal, Typography } from "@mui/material";
import React from "react";
import { LootboxData, NFT } from "../utils/types";
import { NftCard } from "./NftCard";
import { CustomButton } from "./CustomButton";

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
  nfts: NFT[];
  selectedNFTIndex: number;
  disable: boolean;
  handleClose: () => void;
  handleChangeIndex: (index: number) => void;
  addItem: () => void;
};

const AddItemToLootboxModal: React.FC<Props> = ({ open, lootbox, nfts, selectedNFTIndex, disable, handleClose, handleChangeIndex, addItem }) => {
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
          <Typography variant="subtitle1">
            {selectedNFTIndex == -1 ? (
              "You haven't chosen a NFT yet."
            ) : (
              <>
                Selected NFT index: <b>{selectedNFTIndex}</b>
              </>
            )}
          </Typography>
        </Grid>
        <Grid container marginTop={"2rem"}>
          {nfts?.length > 0 &&
            nfts.map((nft: any, index: number) => (
              <Grid item md={4} key={index}>
                <NftCard key={index} asset={nft.asset} description={nft.desciption} index={index} name={nft.name} onClick={() => handleChangeIndex(index)}></NftCard>
              </Grid>
            ))}
        </Grid>
        <Grid item display={"flex"} justifyContent={"center"} marginTop={"2rem"}>
          <CustomButton disabled={disable} label="Add Item" onClick={addItem}></CustomButton>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddItemToLootboxModal;
