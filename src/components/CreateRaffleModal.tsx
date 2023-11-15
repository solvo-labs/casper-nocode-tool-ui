import { Box, CircularProgress, Grid, LinearProgress, MenuItem, Modal, SelectChangeEvent, Stack, TextField, Theme, Typography } from "@mui/material";
import { CustomSelect } from "./CustomSelect.tsx";
import { CustomDateTime } from "./CustomDateTime.tsx";
import { CustomButton } from "./CustomButton.tsx";
import React from "react";
import { makeStyles } from "@mui/styles";
import { CollectionMetada, NFT, Raffle } from "../utils/types.ts";
import { Moment } from "moment";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "70vw",
    minWidth: "70vw",
    justifyContent: "center",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      maxWidth: "90vw",
      marginTop: "4rem",
    },
  },
  modalStyle: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
  title: {
    borderBottom: "1px solid #FF0011 !important",
  },
}));

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid red",
  boxShadow: 48,
  p: 4,
  borderRadius: "12px",
  color: "black",
};

type Props = {
  raffle: Raffle;
  createRaffle: () => void;
  raffleOnChange: (param: Raffle) => void;
  open: boolean;
  onClose: () => void;
  loadingCollection: boolean;
  loadingNFT: boolean;
  collections: CollectionMetada[];
  nfts: NFT[];
  disable: boolean;
};
const CreateRaffleModal: React.FC<Props> = ({ raffle, createRaffle, open, onClose, loadingCollection, loadingNFT, collections, nfts, raffleOnChange, disable }) => {
  const classes = useStyles();

  return (
    <Modal className={classes.modalStyle} open={open} onClose={onClose}>
      <Box sx={style}>
        {loadingCollection ? (
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
          <Grid container direction={"column"}>
            <Typography className={classes.title} variant="h6" display={"flex"}>
              Create New Raffle
            </Typography>
            <Stack marginTop={"2rem"} spacing={4}>
              <TextField
                label="Name"
                name="name"
                onChange={(e: any) => raffleOnChange({ ...raffle, name: e.target.value })}
                placeholder="Name"
                type="text"
                value={raffle.name ? raffle.name : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderRadius: "1rem",
                      border: "1px solid #BFBFBF",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FF0011",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FF0011",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#FF0011",
                  },
                }}
              ></TextField>
              <CustomSelect
                value={raffle.collectionHash ? raffle.collectionHash : "default"}
                id="collectionHash"
                onChange={(event: SelectChangeEvent) => {
                  const data = collections.find((tk: any) => tk.contractHash === event.target.value);
                  // @ts-ignore
                  raffleOnChange({ ...raffle, collectionHash: data.contractHash, nftIndex: -1 });
                }}
              >
                <MenuItem value="default">
                  <em>Select a Collection</em>
                </MenuItem>
                {collections.map((tk: any) => {
                  return (
                    <MenuItem key={tk.contractHash} value={tk.contractHash}>
                      {tk.collection_name}
                    </MenuItem>
                  );
                })}
              </CustomSelect>
              {loadingNFT ? (
                raffle.collectionHash && (
                  <div>
                    <LinearProgress />
                  </div>
                )
              ) : (
                <CustomSelect
                  value={raffle.nftIndex}
                  id="customselect"
                  onChange={(event: any) => {
                    raffleOnChange({ ...raffle, nftIndex: event.target.value });
                  }}
                >
                  <MenuItem key={-1} value={-1}>
                    <em>Select a NFT</em>
                  </MenuItem>
                  {nfts.map((nft: any, index: number) => {
                    return (
                      <MenuItem key={index} value={index}>
                        {"[" + index + "] " + nft.name}
                      </MenuItem>
                    );
                  })}
                </CustomSelect>
              )}
              <TextField
                label="Price"
                name="price"
                onChange={(e: any) => raffleOnChange({ ...raffle, price: Number(e.target.value) })}
                placeholder="Price"
                type="number"
                value={raffle.price ? raffle.price : 0}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderRadius: "1rem",
                      border: "1px solid #BFBFBF",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FF0011",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FF0011",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#FF0011",
                  },
                }}
              ></TextField>
              <Grid item>
                <CustomDateTime
                  // label="startRaffle"
                  dateLabel="Pick start date"
                  clockLabel="Pick start time"
                  onChange={(e: Moment) => raffleOnChange({ ...raffle, start: e.unix() })}
                  value={raffle.start}
                  theme="Light"
                />
              </Grid>
              <Grid item>
                <CustomDateTime
                  theme="Light"
                  dateLabel="Pick end date"
                  clockLabel="Pick end time"
                  onChange={(e: Moment) => raffleOnChange({ ...raffle, end: e.unix() })}
                  value={raffle.end}
                />
              </Grid>
              <Grid item display={"flex"} justifyContent={"center"}>
                <CustomButton disabled={disable} label="Create Raffle" onClick={createRaffle}></CustomButton>
              </Grid>
            </Stack>
          </Grid>
        )}
      </Box>
    </Modal>
  );
};

export default CreateRaffleModal;
