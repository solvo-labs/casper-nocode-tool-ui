import {
    Box,
    CircularProgress,
    Grid,
    LinearProgress,
    MenuItem,
    Modal,
    SelectChangeEvent,
    Stack, Theme,
    Typography
} from "@mui/material";
import {CustomSelect} from "./CustomSelect.tsx";
import {CustomInput} from "./CustomInput.tsx";
import {CustomDateTime} from "./CustomDateTime.tsx";
import {CustomButton} from "./CustomButton.tsx";
import React from "react";
import {makeStyles} from "@mui/styles";
import {CollectionMetada, NFT, Raffle} from "../utils/types.ts";
import {Moment} from "moment";

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
    modalStyle: {backgroundColor: "rgba(0, 0, 0, 0.75)"},
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
    raffle:Raffle;
    raffleOnChange: (param: Raffle) => void;
    open: boolean;
    onClose: () => void;
    loadingCollection: boolean;
    loadingNFT: boolean;
    collections: CollectionMetada[];
    nfts: NFT[];
    selectedCollection: CollectionMetada | undefined;
    collectionOnChange: (param: CollectionMetada) => void;
    selectedNFTIndex: number | undefined;
    nftOnChange: (param: number) => void;
}
const CreateRaffleModal: React.FC<Props> = ({raffle,open, onClose, loadingCollection, loadingNFT, collections, nfts, selectedCollection,selectedNFTIndex, raffleOnChange , collectionOnChange, nftOnChange}) => {
    const classes = useStyles();

    return(
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
                                value={selectedNFTIndex ? selectedNFTIndex : "default"}
                                id="customselect"
                                onChange={(event: any) => {
                                    nftOnChange(event.target.value);
                                }}
                            >
                                <MenuItem
                                    key={"default"}
                                    value={"default"}
                                //     onChange={() =>
                                        // setSelectedNFTIndex(undefined)
                                // }
                                >
                                    <em>Select a NFT</em>
                                </MenuItem>
                                {nfts.map((nft: any, index: number) => {
                                    return (
                                        <MenuItem key={index} value={index}>
                                            {nft.name}
                                        </MenuItem>
                                    );
                                })}
                            </CustomSelect>
                        )}
                        <CustomInput
                            label="Price"
                            name="price"
                            onChange={(e: any) =>
                                raffleOnChange({ ...raffle, price: e.target.value })
                            }
                            placeholder="Price"
                            type="number"
                            value={raffle.price}
                            disable={false}
                            floor={"light"}
                        ></CustomInput>
                        <Grid item>
                            <CustomDateTime
                                // label="startRaffle"
                                firstLabel="Pick start date"
                                secondLabel="Pick start time"
                                onChange={(e: Moment) =>
                                    raffleOnChange({ ...raffle, start: e.unix() })
                                }
                                value={raffle.start}
                            />
                        </Grid>
                        <Grid item>
                            <CustomDateTime
                                firstLabel="Pick end date"
                                secondLabel="Pick end time"
                                onChange={(e: Moment) =>
                                    raffleOnChange({ ...raffle, end: e.unix() })
                                }
                                value={raffle.end}
                            />
                        </Grid>
                        <Grid item display={"flex"} justifyContent={"center"}>
                            <CustomButton
                                disabled={false}
                                label="Create Raffle"
                                onClick={() => console.log(raffle)}
                            ></CustomButton>
                        </Grid>
                    </Stack>
                </Grid>
            )}
        </Box>
    </Modal>);
}

export default CreateRaffleModal;