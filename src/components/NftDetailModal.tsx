import { Box, CircularProgress, Modal, Theme, Typography } from "@mui/material";
import { NftCard } from "./NftCard.tsx";
import { makeStyles } from "@mui/styles";
import React from "react";

const style = {
  position: "absolute" as "absolute",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 540,
  top: "50%",
  left: "50%",
  overflow: "auto",
  backgroundColor: "#0F1429",
  border: "2px solid red",
  borderRadius: "12px",
  p: 4,
  "&:focus": {
    outline: "none",
  },
};

const useStyles = makeStyles((_theme: Theme) => ({
  title: {
    fontSize: "2rem !important",
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
    marginTop: "1rem !important",
    marginBottom: "1rem !important",
  },
  modalStyle: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
}));

type Props = {
  open: boolean;
  loading: boolean;
  nft: any;
  handleClose: () => void;
};

export const NftDetailModal: React.FC<Props> = ({ open, loading, nft, handleClose }) => {
  const classes = useStyles();

  return (
    <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography className={classes.title}>Raffle Reward NFT</Typography>
        {loading ? (
          <div
            style={{
              height: "80%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </div>
        ) : nft ? (
          <NftCard asset={nft?.asset} description={nft?.description} index={nft?.index} name={nft?.name}></NftCard>
        ) : (
          <Typography>Error</Typography>
        )}
      </Box>
    </Modal>
  );
};
