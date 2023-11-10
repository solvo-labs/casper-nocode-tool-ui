import { Box, CircularProgress, Divider, Grid, MenuItem, Modal, Stack, Typography, Tooltip } from "@mui/material";
import React from "react";
import { LootboxData, NFT } from "../utils/types";
import { NftCard } from "./NftCard";
import { CustomButton } from "./CustomButton";
import { CustomInput } from "./CustomInput";
import { CustomSelect } from "./CustomSelect";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { rarityLevelExplanationTitle } from "../utils";

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
  rarity: number;
  rarityList: any[];
  handleClose: () => void;
  handleChangeIndex: (index: number) => void;
  addItem: () => void;
  handleChangeItemName: (text: string) => void;
  handleChangeItemRarity: (rarity: string) => void;
  showButtonOnChange: () => void;
  withdrawOnClick: () => void;
  approveOnClick: () => void;
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
  rarity,
  rarityList,
  handleClose,
  handleChangeIndex,
  handleChangeItemRarity,
  addItem,
  handleChangeItemName,
  showButtonOnChange,
  withdrawOnClick,
  approveOnClick,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
        {loadingNFT ? (
          <div
            style={{
              height: "100%",
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
              <Grid container direction={"row"} justifyContent={"space-between"}>
                <Typography variant="h5">
                  Lootbox <b>{lootbox.name}</b>
                </Typography>
                <CustomButton disabled={false} label="Approve Collection" onClick={approveOnClick}></CustomButton>
              </Grid>
              <Typography variant="subtitle1">
                Collection is <b>{collection.collection_name}</b> , Max Lootbox count is <b>{lootbox.max_lootboxes}</b> , Item count per lootbox is{" "}
                <b>{lootbox.items_per_lootbox}</b>
              </Typography>
              <Typography variant="subtitle1">
                Earning <b>{lootbox.earning} (CSPR)</b>
                <CustomButton onClick={withdrawOnClick} style={{ marginLeft: "1rem" }} label={"Withdraw"} disabled={lootbox.earning === 0}></CustomButton>
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
                            Select NFT for add to <b>{lootbox.name}</b>
                          </>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "center" }}>There are no nft's</div>
                        )}
                      </>
                    ) : (
                      <>
                        {items.length > 0 ? (
                          <>
                            Existing items in <b>{lootbox.name}</b> {"(" + lootbox.deposited_item_count + "/" + lootbox.max_lootboxes * lootbox.items_per_lootbox + ")"}
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
            {isAddItem && nfts.length > 0 && (
              <Grid container direction={"column"} marginTop={"1rem"} gap={4}>
                <Divider
                  sx={{
                    color: "red",
                    "&::before, &::after": {
                      borderTop: "thin solid gray !important",
                    },
                  }}
                >
                  Item Features
                </Divider>
                <Stack direction={"row"} spacing={2} alignItems={"center"}>
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
                    style={{ width: "50%" }}
                  />
                  <div style={{ width: "50%", display: "flex", flexDirection: "row", justifyItems: "center", alignItems: "center" }}>
                    <CustomSelect
                      value={rarity}
                      id="collectionHash"
                      onChange={(e: any) => {
                        handleChangeItemRarity(e.target.value);
                      }}
                    >
                      <MenuItem value="-1">
                        <em>Select a Rarity</em>
                      </MenuItem>
                      {rarityList.map((rr: any, index: number) => {
                        return (
                          <MenuItem key={index} value={index}>
                            {rr}
                          </MenuItem>
                        );
                      })}
                    </CustomSelect>
                  </div>
                  <Tooltip title={<div style={{ whiteSpace: "pre-line" }}>{rarityLevelExplanationTitle}</div>}>
                    <div style={{ background: "gray", borderRadius: "12px", height: "24px", width: "24px", display: "flex", justifyItems: "center", alignItems: "center" }}>
                      <QuestionMarkIcon sx={{ color: "white", height: "16px" }}></QuestionMarkIcon>
                    </div>
                  </Tooltip>
                </Stack>

                <Grid item display={"flex"} justifyContent={"flex-end"}>
                  <CustomButton disabled={disable} label="Add Item" onClick={addItem}></CustomButton>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddItemToLootboxModal;
