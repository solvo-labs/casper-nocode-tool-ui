import { Box, CircularProgress, Grid, Modal, Typography } from "@mui/material";
import React from "react";
import { LootboxData, NFT } from "../utils/types";
import { NftCard } from "./NftCard";
import { CustomButton } from "./CustomButton";
import { CustomInput } from "./CustomInput";

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
  disable: boolean;
  loadingNFT: boolean;
  collection: any;
  isAddItem: boolean;
  itemName: string;
  selectedNFTIndex?: number;
  handleClose: () => void;
  handleChangeIndex: (index: number) => void;
  addItem: () => void;
  handleChangeItemName: (text: string) => void;
};

const AddItemToLootboxModal: React.FC<Props> = ({
  open,
  lootbox,
  nfts,
  disable,
  loadingNFT,
  collection,
  isAddItem,
  itemName,
  selectedNFTIndex,
  handleClose,
  handleChangeIndex,
  addItem,
  handleChangeItemName,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
        {loadingNFT ? (
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
        ) : (
          <>
            <Grid container direction={"column"} gap={1}>
              <Typography variant="h5">
                Lootbox <b>{lootbox.name}</b>
              </Typography>
              <Typography variant="subtitle1">
                Collection is <b>{collection.collection_name}</b> , Lootbox Count is <b>{lootbox.lootbox_count}</b> , Item count per lootbox is <b>{lootbox.items_per_lootbox}</b>
              </Typography>
              <Typography variant="subtitle1">
                {selectedNFTIndex !== undefined && (
                  <>
                    Selected NFT index: <b>{selectedNFTIndex}</b>
                  </>
                )}
              </Typography>
            </Grid>
            <Grid container marginTop={"2rem"}>
              <div style={{ textAlign: "center", width: "100%", marginBottom: "0.5rem" }}>
                <Typography variant="h5">
                  {isAddItem ? (
                    <>
                      Add Item to <b>{lootbox.name}</b>
                    </>
                  ) : (
                    "Existing Items"
                  )}
                </Typography>
              </div>
              {nfts.map((nft: any, index: number) => (
                <Grid item md={4} key={index}>
                  <NftCard
                    key={nft.index}
                    asset={nft.asset}
                    description={nft.desciption}
                    index={index}
                    name={nft.name}
                    onClick={() => handleChangeIndex(nft.index)}
                    isSelected={selectedNFTIndex === nft.index}
                    amIOwner={nft.isMyNft}
                  />
                </Grid>
              ))}
            </Grid>
            <Grid display={"flex"} justifyContent={"space-between"} marginTop={"0.5rem"}>
              <CustomInput
                placeholder="Item Name"
                label="Item Name"
                id="itemName"
                name="itemName"
                type="text"
                onChange={(e: any) => {
                  handleChangeItemName(e.target.value);
                }}
                value={itemName}
                style={{ width: "70%" }}
              />
              <CustomButton disabled={disable} style={{ width: "25%" }} label="Add Item" onClick={addItem}></CustomButton>
            </Grid>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddItemToLootboxModal;
