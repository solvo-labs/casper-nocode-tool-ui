import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Modal,
  RadioGroup,
  SelectChangeEvent,
  Stack,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { NftCard } from "./NftCard.tsx";
import { makeStyles } from "@mui/styles";
import { APPROVE_TYPE, CollectionMetada, LootboxData, Marketplace, NFT, RaffleMetadata, RaffleNamedKeys } from "../utils/types.ts";
import { CustomButton } from "./CustomButton.tsx";
import React from "react";
import { CustomSelect } from "./CustomSelect.tsx";
import CustomRadioButton from "./CustomRadioIcon.tsx";
import { DAPPEND_NFT_CONTRACT } from "../utils/index.ts";

const style = {
  position: "absolute" as "absolute",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 600,
  top: "50%",
  left: "50%",
  overflow: "auto",
  backgroundColor: "#0F1429",
  border: "2px solid red",
  borderRadius: "12px",
  p: 4,
};

const style2 = {
  position: "absolute" as "absolute",
  transform: "translate(-50%, -50%)",
  width: 600,
  top: "50%",
  left: "50%",
  backgroundColor: "#0F1429",
  border: "2px solid red",
  boxShadow: 48,
  p: 4,
  borderRadius: "12px",
};

type ListNFTModalProps = {
  collection: CollectionMetada;
  open: boolean;
  handleClose: () => void;
  loading: boolean;
  nfts: NFT[] | any;
  selectedNFTIndex: (param: number) => void;
  handleOpenApprove?: any;
};
type ApproveModal = {
  selected: string | undefined;
  selectedOnChange: (param: string) => void;
  marketplaces: Marketplace[] | undefined;
  raffles: RaffleNamedKeys[] | undefined;
  lootboxes: LootboxData[] | undefined;
  open: boolean;
  handleClose: () => void;
  approve: () => void;
  approveOperatorType: string;
  approveOperatorOnChange: (param: string) => void;
  disable: boolean;
};

const useStyles = makeStyles((_theme: Theme) => ({
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
  modalStyle: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
}));

export const ListNFTModal: React.FC<ListNFTModalProps> = ({ collection, open, handleClose, loading, nfts, selectedNFTIndex, handleOpenApprove }) => {
  const classes = useStyles();
  return (
    <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
      <Box sx={style}>
        {loading ? (
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
          <Grid container>
            <Grid item marginBottom={"2rem"}>
              <Typography className={classes.title} variant="h6">
                Select {collection.name}'s NFT and Approve For Operator
              </Typography>
            </Grid>
            <Grid container>
              {nfts.map((e: any, index: number) => (
                <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                  <NftCard
                    description={e.description}
                    name={e.name}
                    asset={e.asset}
                    onClick={() => {
                      handleOpenApprove();
                      selectedNFTIndex(index);
                    }}
                    index={index}
                  ></NftCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Box>
    </Modal>
  );
};
export const ApproveNFTModal: React.FC<ApproveModal> = ({
  selected,
  marketplaces,
  raffles,
  lootboxes,
  open,
  approveOperatorType,
  disable,
  selectedOnChange,
  handleClose,
  approve,
  approveOperatorOnChange,
}) => {
  const classes = useStyles();

  return (
    <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
      <Box sx={style} display={"flex !important"}>
        <Grid container direction={"column"} justifyContent={"center"}>
          <Grid item display={"flex"} justifyContent={"center"}>
            <Typography className={classes.title} color={"white"} variant="h6">
              Approve
            </Typography>
          </Grid>
          <Grid item marginTop={"2rem"} display={"flex"} justifyContent={"center"}>
            <Stack spacing={"2rem"}>
              <FormControl>
                <FormLabel sx={{ display: "flex", justifyContent: "center", color: "white" }}>Which one would you like to use for approval?</FormLabel>
                <RadioGroup row sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                  <FormControlLabel
                    value="marketplace"
                    control={<CustomRadioButton />}
                    label="Marketplace"
                    onClick={(e: any) => {
                      approveOperatorOnChange(e.target.value);
                      selectedOnChange("default");
                    }}
                  />
                  <FormControlLabel
                    value="raffle"
                    control={<CustomRadioButton />}
                    label="Raffle"
                    onClick={(e: any) => {
                      approveOperatorOnChange(e.target.value);
                      selectedOnChange("default");
                    }}
                  />
                  <FormControlLabel
                    value="lootbox"
                    control={<CustomRadioButton />}
                    label="Lootbox"
                    onClick={(e: any) => {
                      approveOperatorOnChange(e.target.value);
                      selectedOnChange("default");
                    }}
                  />
                  <FormControlLabel
                    value="custom-nft"
                    control={<CustomRadioButton />}
                    label="Custom NFT"
                    onClick={(e: any) => {
                      approveOperatorOnChange(e.target.value);
                      selectedOnChange("hash-" + DAPPEND_NFT_CONTRACT);
                    }}
                  />
                </RadioGroup>
              </FormControl>
              {approveOperatorType == APPROVE_TYPE.MARKETPLACE && (
                <FormControl>
                  <CustomSelect
                    id="marketplaces"
                    label="Marketplaces"
                    value={selected ? selected : "default"}
                    onChange={(event: SelectChangeEvent) => selectedOnChange(event.target.value)}
                  >
                    <MenuItem key={"default"} value={"default"}>
                      Select Marketplace
                    </MenuItem>
                    {marketplaces &&
                      marketplaces.map((mp: any, index: number) => {
                        return (
                          <MenuItem key={index} value={mp.contractHash}>
                            {(mp.contractName ? mp.contractName : "nameless") + "[" + index + "]"}
                          </MenuItem>
                        );
                      })}
                  </CustomSelect>
                </FormControl>
              )}
              {approveOperatorType == APPROVE_TYPE.RAFFLE && (
                <FormControl>
                  <CustomSelect id="raffle" value={selected ? selected : "default"} label="Raffles" onChange={(event: SelectChangeEvent) => selectedOnChange(event.target.value)}>
                    <MenuItem value={"default"}>Select Raffle</MenuItem>
                    {raffles &&
                      raffles.map((rf: any, index: number) => {
                        return (
                          <MenuItem key={index} value={rf.key}>
                            {rf.name}
                          </MenuItem>
                        );
                      })}
                  </CustomSelect>
                </FormControl>
              )}
              {approveOperatorType == APPROVE_TYPE.LOOTBOX && (
                <FormControl>
                  <CustomSelect id="raffle" value={selected ? selected : "default"} label="Raffles" onChange={(event: SelectChangeEvent) => selectedOnChange(event.target.value)}>
                    <MenuItem value={"default"}>Select Lootbox</MenuItem>
                    {lootboxes &&
                      lootboxes.map((lb: any, index: number) => {
                        return (
                          <MenuItem key={index} value={lb.key}>
                            {lb.name}
                          </MenuItem>
                        );
                      })}
                  </CustomSelect>
                </FormControl>
              )}
              {approveOperatorType == APPROVE_TYPE.CUSTOM_NFT && (
                <div>
                  <Typography>Custom NFT contract:</Typography>
                  <Typography variant="subtitle1">{DAPPEND_NFT_CONTRACT}</Typography>
                </div>
              )}
              <Stack direction={"row"} spacing={"2rem"} justifyContent={"center"}>
                <CustomButton disabled={false} label="Back" onClick={handleClose}></CustomButton>
                <CustomButton disabled={disable} label="Confirm" onClick={approve}></CustomButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

type ApproveNFTonRafflePage = {
  open: boolean;
  handleClose: () => void;
  approve: () => void;
  selectedRaffle?: RaffleMetadata | undefined;
};

export const ApproveNFTModalonRaffePage: React.FC<ApproveNFTonRafflePage> = ({ open, handleClose, approve, selectedRaffle }) => {
  const classes = useStyles();

  return (
    <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
      <Box sx={style2}>
        <Grid container direction={"column"}>
          <Grid item marginBottom={"2rem"}>
            <Typography className={classes.title} variant="h6" display={"flex"}>
              Select NFT and Approve For Operator
            </Typography>
          </Grid>
          <Stack direction={"column"} spacing={4}>
            <Typography>Operator: {selectedRaffle?.name}</Typography>
            <Tooltip title={selectedRaffle?.key}>
              <Typography>Raffle Contract Hash: {selectedRaffle?.key.slice(0, 30)}</Typography>
            </Tooltip>
            <Typography>NFT Collection: {selectedRaffle?.collection.slice(0, 30)}</Typography>
            <Typography>NFT Index: {selectedRaffle?.nft_index as unknown as number}</Typography>
            <Grid item display={"flex"} justifyContent={"center"}>
              <CustomButton label={"Approve NFT"} onClick={approve} disabled={false}></CustomButton>
            </Grid>
          </Stack>
        </Grid>
      </Box>
    </Modal>
  );
};
