import {
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import { fetchCep78NamedKeys, fetchRaffleNamedKeys, getNftCollection, getNftMetadata, getRaffleDetails, SERVER_API } from "../../utils/api";
import { CollectionMetada, NFT, RAFFLE_STATUS, Raffle, RaffleMetadata } from "../../utils/types";
import moment from "moment";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CreateRaffleModal from "../../components/CreateRaffleModal.tsx";
import { CasperHelpers, STORE_RAFFLE_CONTRACT_HASH, uint32ArrayToHex } from "../../utils";
//@ts-ignore
import { CLAccountHash, CLByteArray, CLKey, CLPublicKey, CLValueBuilder, Contracts, DeployUtil, RuntimeArgs } from "casper-js-sdk";
import axios from "axios";
import { ApproveNFTModalonRaffePage } from "../../components/NFTApproveModal.tsx";
import { useOutletContext } from "react-router-dom";
import toastr from "toastr";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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
  table: {
    marginTop: "4rem",
  },
  paper: {
    border: "1px solid #FF0011",
    padding: "1rem",
  },
  tab: {
    "& .MuiTabs": {
      color: "#FFFFFF !important",
    },
    "& .MuiTabs-indicator": {
      background: "#FF0011 !important",
    },
    "& .Mui-selected": {
      color: "#FFFFFF !important",
    },
    "& .MuiButtonBase-root.MuiTab-root": {
      fontSize: "1rem",
      color: "gray",
    },
  },
}));

const ManageRaffle = () => {
  const classes = useStyles();
  // const navigate = useNavigate();
  const [publicKey, provider, , , , , , raffleWasm] =
    useOutletContext<
      [publicKey: string, provider: any, cep18Wasm: any, cep78Wasm: any, marketplaceWasm: any, vestingWasm: any, executeListingWasm: any, raffleWasm: any, buyTicketWasm: any]
    >();

  const [raffleOpen, setRaffleOpen] = useState<boolean>(false);
  const [approveModal, setApproveModal] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCollection, setLoadingCollection] = useState<boolean>(false);
  const [loadingNFT, setLoadingNFT] = useState<boolean>(true);

  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nfts, setNfts] = useState<NFT[] | any>([]);

  const [raffleMore, setRaffleMore] = useState<null | HTMLElement>(null);
  const raffleMoreOpen = Boolean(raffleMore);

  const [clickedRaffle, setClickedRaffle] = useState<RaffleMetadata>();

  const [raffles, setRaffles] = useState<any[] | undefined>();

  const [raffleData, setRaffleData] = useState<Raffle>({
    name: "",
    collectionHash: "",
    nftIndex: -1,
    start: moment().unix(),
    end: moment().unix(),
    price: 0,
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, state: any) => {
    state(event.currentTarget);
  };

  const handleMenuClose = (state: any) => {
    state(null);
  };

  const handleOpen = (state: any) => {
    state(true);
  };
  const handleClose = (state: any) => state(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const approve = async () => {
    setLoading(true);
    try {
      if (clickedRaffle?.key) {
        const contract = new Contracts.Contract();
        contract.setContractHash("hash-" + clickedRaffle.collection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const raffleHash = clickedRaffle.key.replace("hash-", "");

        const args = RuntimeArgs.fromMap({
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(raffleHash, "hex")))),
          token_id: CLValueBuilder.u64(clickedRaffle.nft_index),
        });

        const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "2500000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve deployed successfully.");
          setApproveModal(false);
          setLoading(false);

          deposit();
          // navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const deposit = async () => {
    setLoading(true);
    try {
      if (clickedRaffle?.key) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const contract = new Contracts.Contract();
        contract.setContractHash(clickedRaffle.key);

        const args = RuntimeArgs.fromMap({});

        const deploy = contract.callEntrypoint("deposit", args, ownerPublicKey, "casper-test", "5000000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Deposit successfully.");
          setLoading(false);
          // navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const draw = async () => {
    setLoading(true);
    try {
      if (clickedRaffle) {
        const contract = new Contracts.Contract();
        contract.setContractHash(clickedRaffle.key);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({});

        const deploy = contract.callEntrypoint("draw", args, ownerPublicKey, "casper-test", "5000000000");
        console.log(deploy);

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve deployed successfully.");
          setApproveModal(false);
          setLoading(false);
          // navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const contract = new Contracts.Contract();
      contract.setContractHash(clickedRaffle?.key);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({});

      const deploy = contract.callEntrypoint("cancel", args, ownerPublicKey, "casper-test", "5000000000");
      console.log(deploy);

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });

        toastr.success(response.data, "Approve deployed successfully.");
        setApproveModal(false);
        setLoading(false);
        // navigate("/marketplace");
      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const install = async () => {
    setLoading(true);
    try {
      if (!disable) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();

        const args = RuntimeArgs.fromMap({
          name: CLValueBuilder.string(raffleData.name),
          start_date: CLValueBuilder.u64(raffleData.start * 1000),
          end_date: CLValueBuilder.u64(raffleData.end * 1000),
          collection: CasperHelpers.stringToKey(raffleData.collectionHash),
          nft_index: CLValueBuilder.u64(raffleData.nftIndex),
          price: CLValueBuilder.u512(raffleData.price * 1000000000),
          storage_key: new CLAccountHash(Buffer.from(STORE_RAFFLE_CONTRACT_HASH, "hex")),
        });

        const deploy = contract.install(new Uint8Array(raffleWasm), args, "150000000000", ownerPublicKey, "casper-test");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });
          toastr.success(response.data, "Raffle deployed successfully.");
          setRaffleOpen(false);
          setLoading(false);
          // navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
          setLoading(false);
        }
      }
    } catch (error: any) {
      setLoading(false);
      toastr.error(error);
      console.log(error);
    }
  };

  useEffect(() => {
    setLoadingCollection(true);
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));
      const result = await Promise.all(promises);

      setLoadingCollection(false);
      setCollections(result);
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoadingNFT(true);
      if (raffleData.collectionHash && raffleData.collectionHash != "") {
        const nftCollection = await getNftCollection(raffleData.collectionHash);
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const accountHash = ownerPublicKey.toAccountHashStr();

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(raffleData.collectionHash, index.toString(), accountHash.slice(13)));
        }

        const nftMetas = await Promise.all(promises);
        setNfts(nftMetas);
        setLoadingNFT(false);
      }
    };

    init();
  }, [raffleData.collectionHash]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchRaffleNamedKeys(publicKey);

      const raffleDetailsPromises = data.map((rf: any) => getRaffleDetails(rf.key));

      const raffleDetails = await Promise.all(raffleDetailsPromises);

      const finalData: any[] = raffleDetails.map((raffle: RaffleMetadata) => {
        return {
          key: raffle.key,
          collection: uint32ArrayToHex(raffle.collection),
          name: raffle.name,
          owner: uint32ArrayToHex(raffle.owner),
          nft_index: Number(raffle.nft_index.hex),
          start_date: Number(raffle.start_date.hex),
          end_date: Number(raffle.end_date.hex),
          price: Number(raffle.price.hex),
          claimed: raffle.claimed,
          status: raffle.status,
          cancelable: raffle.cancelable,
        };
      });

      setRaffles(finalData);
      setLoading(false);
    };
    init();
  }, []);

  const disable = useMemo(() => {
    const time: boolean = !(raffleData.start >= raffleData.end);
    const collection: boolean = !(raffleData.collectionHash == "");
    const nft: boolean = !(raffleData.nftIndex < 0);
    const price: boolean = !(raffleData.price <= 0);
    const name: boolean = !(!raffleData.name.length || raffleData.name.startsWith(" "));
    return !(name && price && time && collection && nft);
  }, [raffleData]);

  const getStatus = (status: number) => {
    if (status === RAFFLE_STATUS.WAITING_DEPOSIT) {
      return "Waiting Deposit";
    }

    if (status === RAFFLE_STATUS.ONGOING) {
      return "Ongoing";
    }

    if (status === RAFFLE_STATUS.FINISHED) {
      return "Finished";
    }

    if (status === RAFFLE_STATUS.WAITING_DRAW) {
      return "Waiting Draw";
    }

    if (status === RAFFLE_STATUS.WAITING_CLAIM) {
      return "Waiting Claim";
    }

    if (status === RAFFLE_STATUS.COMPLETED) {
      return "Completed";
    }
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <Grid container className={classes.container}>
      <Stack direction={"row"} width={"100%"} justifyContent={"space-between"}>
        <Typography variant="h4" className={classes.title}>
          Manage Raffles
        </Typography>
        <CustomButton disabled={false} label="Create new Raffle" onClick={() => handleOpen(setRaffleOpen)}></CustomButton>
        <CreateRaffleModal
          raffle={raffleData}
          createRaffle={install}
          raffleOnChange={setRaffleData}
          open={raffleOpen}
          onClose={() => handleClose(setRaffleOpen)}
          loadingCollection={loadingCollection}
          loadingNFT={loadingNFT}
          collections={collections}
          nfts={nfts}
          disable={disable}
        ></CreateRaffleModal>
      </Stack>
      <Grid container width={"100%"} display={"grid"} className={classes.tab}>
        <Grid className={classes.table} justifyContent={"center"}>
          <Paper className={classes.paper}>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell key="name" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Name
                      </Typography>
                    </TableCell>
                    <TableCell key="symbol" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Start date
                      </Typography>
                    </TableCell>
                    <TableCell key="decimal" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        End date
                      </Typography>
                    </TableCell>
                    <TableCell key="nft-id" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        NFT ID
                      </Typography>
                    </TableCell>
                    <TableCell key="raffle-price" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Price
                      </Typography>
                    </TableCell>
                    <TableCell key="status" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell key="claimed" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Claimed
                      </Typography>
                    </TableCell>
                    <TableCell key="raffle-actions" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {raffles &&
                    raffles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((raffle: any, index: number) => {
                      return (
                        <TableRow style={{ cursor: "pointer" }} key={index}>
                          <TableCell align="left">
                            <Typography color="#0f1429">{raffle.name}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{moment.unix(raffle.start_date / 1000).format("MM/DD/YYYY h:mm A")}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{moment.unix(raffle.end_date / 1000).format("MM/DD/YYYY h:mm A")}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{raffle.nft_index}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{raffle.price / Math.pow(10, 9)} CSPR</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{getStatus(raffle.status)}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <Typography color="#0f1429">{raffle.claimed ? <CheckIcon color="success" /> : <CloseIcon color="error" />}</Typography>
                          </TableCell>
                          <TableCell align="left">
                            <IconButton
                              disabled={raffle.claimed}
                              onClick={(e: any) => {
                                setClickedRaffle(raffle);
                                handleMenuClick(e, setRaffleMore);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              anchorEl={raffleMore}
                              open={raffleMoreOpen}
                              onClose={() => {
                                setClickedRaffle(undefined);
                                handleMenuClose(setRaffleMore);
                              }}
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              sx={{ zIndex: 999 }}
                            >
                              <MenuItem
                                disabled={clickedRaffle?.status !== RAFFLE_STATUS.WAITING_DEPOSIT}
                                onClick={() => {
                                  handleMenuClose(setRaffleMore);
                                  handleOpen(setApproveModal);
                                }}
                              >
                                Deposit NFT
                              </MenuItem>

                              <MenuItem
                                disabled={clickedRaffle?.status !== RAFFLE_STATUS.WAITING_DRAW}
                                onClick={() => {
                                  handleMenuClose(setRaffleMore);
                                  draw();
                                }}
                              >
                                Draw
                              </MenuItem>

                              <MenuItem
                                disabled={!clickedRaffle?.cancelable}
                                onClick={() => {
                                  handleMenuClose(setRaffleMore);
                                  cancel();
                                }}
                              >
                                Cancel
                              </MenuItem>
                            </Menu>
                            <ApproveNFTModalonRaffePage open={approveModal} handleClose={() => handleClose(setApproveModal)} approve={approve} selectedRaffle={clickedRaffle} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[1, 5, 10]}
              component="div"
              count={raffles?.length ? raffles.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ManageRaffle;
