import {
    Box,
    CircularProgress,
    FormControl, FormControlLabel,
    FormLabel,
    Grid, LinearProgress,
    MenuItem,
    Modal,
    RadioGroup, SelectChangeEvent,
    Stack,
    Theme,
    Typography
} from "@mui/material";
import {NftCard} from "./NftCard.tsx";
import {makeStyles} from "@mui/styles";
import { CollectionMetada, NFT} from "../utils/types.ts";
import { CustomButton } from "./CustomButton.tsx";
import React from "react";
import { CustomSelect } from "./CustomSelect.tsx";
import CustomRadioButton from "./CustomRadioIcon.tsx";

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
    width: 400,
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
}
type ApproveModal = {
    listSelected: any[] | undefined;
    selected: string | undefined;
    selectedOnChange: (param: string) => void;
    // marketplace: any;
    open: boolean;
    handleClose: () => void;
    approve: () => void;
    approveOperatorType: string;
    approveOperatorOnChange: (param: string) => void;
}

const useStyles = makeStyles((_theme: Theme) => ({
    title: {
        position: "relative",
        borderBottom: "1px solid #FF0011 !important",
    },
    modalStyle: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
}));

export const ListNFTModal: React.FC<ListNFTModalProps> = ({collection,open,handleClose,loading, nfts,selectedNFTIndex,handleOpenApprove}) => {
    const classes = useStyles();
    return(
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
                                <Grid item lg={4} md={4} sm={6} xs={6}>
                                    <NftCard
                                        description={e.description}
                                        name={e.name}
                                        imageURL={e.imageURL}
                                        onClick={() => {
                                            handleOpenApprove()
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
}
export const ApproveNFTModal: React.FC<ApproveModal> = ({listSelected, selected,selectedOnChange,open,handleClose,approve,approveOperatorType,approveOperatorOnChange}) => {
    const classes = useStyles();

    return(
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
                                    <FormLabel sx={{ color: "white" }}>Which one would you like to use for approval?</FormLabel>
                                    <RadioGroup row sx={{display:"flex", justifyContent:"center", marginTop:"1rem"}}>
                                        <FormControlLabel value="marketplace" control={<CustomRadioButton />} label="Marketplace" onClick={(e:any) => approveOperatorOnChange(e.target.value)}/>
                                        <FormControlLabel value="raffle" control={<CustomRadioButton />} label="Raffle" onClick={(e:any) => approveOperatorOnChange(e.target.value)}/>
                                    </RadioGroup>
                                </FormControl>
                                {approveOperatorType == "marketplace" && (
                                    <FormControl>
                                        <CustomSelect
                                            id="marketplace"
                                            value={selected ? selected : "default"}
                                            label="Marketplaces"
                                            onChange={(e: any) => selectedOnChange(e.target.value)}
                                        >
                                            <MenuItem value={"default"}>Select Marketplace</MenuItem>
                                            {/*{listSelected && listSelected.map((mp: any) => {*/}
                                            {/*    return (*/}
                                            {/*        <MenuItem key={mp.key} value={mp.key}>*/}
                                            {/*            {mp.name}*/}
                                            {/*        </MenuItem>*/}
                                            {/*    );*/}
                                            {/*})}*/}
                                        </CustomSelect>
                                    </FormControl>
                                )}
                                {approveOperatorType == "raffle" && (
                                    <FormControl>
                                        <CustomSelect
                                            id="raflle"
                                            value={selected ? selected : "default"}
                                            label="Raffles"
                                            onChange={(e: any) => selectedOnChange(e.target.value)}
                                        >
                                            <MenuItem value={"default"}>Select Raffle</MenuItem>
                                            {/*{listSelected && listSelected.map((mp: any) => {*/}
                                            {/*    return (*/}
                                            {/*        <MenuItem key={mp.key} value={mp.key}>*/}
                                            {/*            {mp.name}*/}
                                            {/*        </MenuItem>*/}
                                            {/*    );*/}
                                            {/*})}*/}
                                        </CustomSelect>
                                    </FormControl>
                                )}
                                <Stack direction={"row"} spacing={"2rem"} justifyContent={"center"}>
                                    <CustomButton disabled={false} label="Deny" onClick={handleClose}></CustomButton>
                                    <CustomButton disabled={false} label="Confirm" onClick={approve}></CustomButton>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
    );
}

type ApproveNFTonRafflePage = {
    open: boolean;
    handleClose: () => void;
    loadingCollection: boolean;
    loadingNFT: boolean;
    collections: CollectionMetada[];
    nfts: NFT[];
    selectedCollection: CollectionMetada | undefined;
    collectionOnChange: (param: CollectionMetada) => void;
    selectedNFTIndex: number | undefined;
    nftOnChange: (param: number) => void;
    approve: () => void;
}

export const ApproveNFTModalonRaffePage: React.FC<ApproveNFTonRafflePage> = ({open,handleClose, loadingCollection, loadingNFT, collections,nfts, selectedCollection, selectedNFTIndex, collectionOnChange, nftOnChange, approve}) => {
    const classes = useStyles();

    return(
        <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
            <Box sx={style2}>
                {loadingCollection ? (
                    <div
                        style={{
                            height: "40vh",
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
                        <Grid item marginBottom={"2rem"}>
                            <Typography className={classes.title} variant="h6" display={"flex"}>
                                Select  NFT and Approve For Operator
                            </Typography>
                        </Grid>
                        <Stack direction={"column"} spacing={4}>
                            <CustomSelect
                                value={selectedCollection?.contractHash || "default"}
                                id="customselect"
                                onChange={(event: SelectChangeEvent) => {
                                    const data = collections.find(
                                        (tk: any) => tk.contractHash === event.target.value
                                    );
                                    // @ts-ignore
                                    collectionOnChange(data);
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
                                selectedCollection && (
                                    <div>
                                        <LinearProgress />
                                    </div>
                                )
                            ) : (
                                <CustomSelect
                                    value={selectedNFTIndex != -1 ? selectedNFTIndex : -1}
                                    id="customselect"
                                    onChange={(event: any) => {
                                        nftOnChange(event.target.value);
                                    }}
                                >
                                    <MenuItem
                                        key={"default"}
                                        value={-1}
                                            onChange={(event:any) =>
                                        nftOnChange(event.target.value)
                                        }
                                    >
                                        <em>Select a NFT</em>
                                    </MenuItem>
                                    {nfts.map((nft: any, index: number) => {
                                        return (
                                            <MenuItem key={index} value={index}>
                                                {"["+index+"] " + nft.name}
                                            </MenuItem>
                                        );
                                    })}
                                </CustomSelect>
                            )}
                            <Grid item display={"flex"} justifyContent={"center"}>
                                <CustomButton
                                    label={"Approve NFT"}
                                    onClick={approve} disabled={false}
                                ></CustomButton>
                            </Grid>
                        </Stack>
                    </Grid>
                )}
            </Box>
        </Modal>
    );
}

