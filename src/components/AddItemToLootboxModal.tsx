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
  items: NFT[];
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
  showButtonOnChange: () => void;
};

const AddItemToLootboxModal: React.FC<Props> = ({
  open,
  lootbox,
  nfts,
  items,
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
  showButtonOnChange,
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
                Collection is <b>{collection.collection_name}</b> , Max Lootbox count is <b>{lootbox.max_lootboxes}</b> , Item count per lootbox is{" "}
                <b>{lootbox.items_per_lootbox}</b>
              </Typography>
              <Typography variant="subtitle1">
                Earning <b>{lootbox.earning} (CSPR)</b>
                <CustomButton onClick={() => {}} style={{ marginLeft: "1rem" }} label={"Withdraw"} disabled={lootbox.earning === 0}></CustomButton>
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
              <div style={{ width: "100%", marginBottom: "0.5rem" }}>
                <div style={{ textAlign: "center", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h5">
                    {isAddItem ? (
                      <>
                        {nfts.length > 0 ? (
                          <>
                            Add Item to <b>{lootbox.name}</b>
                          </>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "center" }}>There are no nft's</div>
                        )}
                      </>
                    ) : (
                      <>
                        {items.length > 0 ? (
                          <>
                            Existing items in <b>{lootbox.name}</b>
                          </>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "center" }}>There are no items</div>
                        )}
                      </>
                    )}
                  </Typography>
                  {isAddItem ? (
                    <CustomButton label="Show Existing Items" onClick={showButtonOnChange} disabled={false} />
                  ) : (
                    <CustomButton label="Show Addable NFTs." onClick={showButtonOnChange} disabled={false} />
                  )}
                </div>
              </div>
              {(isAddItem ? nfts : items).map((nft: any, index: number) => (
                <Grid item md={4} key={index}>
                  <NftCard
                    key={nft.index}
                    asset={nft.asset}
                    description={nft.description}
                    index={nft.index}
                    name={nft.name}
                    onClick={() => handleChangeIndex(nft.index)}
                    isSelected={selectedNFTIndex === nft.index}
                    amIOwner={nft.isMyNft}
                  />
                </Grid>
              ))}
            </Grid>
            {isAddItem && (
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
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddItemToLootboxModal;
