import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
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
import React, {useEffect, useMemo, useState} from "react";
import {CustomButton} from "../../components/CustomButton";
import {makeStyles} from "@mui/styles";
import {
  fetchCep78NamedKeys,
  fetchRaffleNamedKeys,
  getNftCollection,
  getNftMetadata,
  getRaffleDetails,
  SERVER_API,
} from "../../utils/api";
import {CollectionMetada, NFT, Raffle, RaffleMetadata} from "../../utils/types";
import moment from "moment";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateRaffleModal from "../../components/CreateRaffleModal.tsx";
import {CasperHelpers, uint32ArrayToHex} from "../../utils";
// @ts-ignore
import {CLByteArray, CLKey, CLPublicKey, CLValueBuilder, Contracts, DeployUtil, RuntimeArgs} from "casper-js-sdk";
import axios from "axios";
import {ApproveNFTModalonRaffePage} from "../../components/NFTApproveModal.tsx";
import {useOutletContext} from "react-router-dom";
import toastr from "toastr";


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
  const [publicKey, provider, , , , , , raffleWasm] = useOutletContext<[publicKey: string, provider: any, cep18Wasm :any, cep78Wasm: any, marketplaceWasm:any, vestingWasm:any, executeListingWasm:any,  raffleWasm: any]>();

  const [raffleOpen, setRaffleOpen] = useState<boolean>(false);
  const [approveModal, setApproveModal] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCollection, setLoadingCollection] = useState<boolean>(false);
  const [loadingNFT, setLoadingNFT] = useState<boolean>(true);

  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nfts, setNfts] = useState<NFT[] | any>([]);

  const [tabValue, setTabValue] = useState("1");

  const [raffleMore, setRaffleMore] = useState<null | HTMLElement>(null);
  const raffleMoreOpen = Boolean(raffleMore);



  const [selectedCollection, setSelectedCollection] =
    useState<CollectionMetada>();
  const [selectedTokenId, setSelectedTokenId] = useState<number>();

  const [clickedRaffle, setClickedRaffle] = useState<RaffleMetadata>();
  // const [selectedOperatorHash, setSelectedOperatorHash] = useState<string>();

  // const [listOfApprovable, setListOfApprovable] = useState<any[]>();

  const [raffles, setRaffles] = useState<any[] | undefined>();

  const [raffle, setRaffle] = useState<Raffle>({
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

  // @ts-ignore
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleOpen = (state:any) => {
    state(true)
  };
  const handleClose = (state:any) => state(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // const fetchNft = async (contract: string) => {
  //   setLoadingNFT(true);
  //   if (contract) {
  //     const nftCollection = await getNftCollection(contract);
  //
  //     const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);
  //
  //     let promises = [];
  //     for (let index = 0; index < nftCount; index++) {
  //       promises.push(getNftMetadata(contract, index.toString()));
  //     }
  //
  //     const nftMetas= await Promise.all(promises);
  //     const imagePromises = nftMetas.map((e: any) => getMetadataImage(e, FETCH_IMAGE_TYPE.NFT));
  //     const images = await Promise.all(imagePromises);
  //
  //     const finalData = nftMetas.map((e: any, index: number) => {
  //       return {
  //         ...e,
  //         imageURL: images[index],
  //       };
  //     });
  //
  //     nfts(finalData);
  //     setLoadingNFT(false);
  //   }
  // };

  // const approve = async () => {
  //   try {
  //     if (selectedHash) {
  //       const contract = new Contracts.Contract();
  //       contract.setContractHash(selectedCollection);
  //       const ownerPublicKey = CLPublicKey.fromHex(publicKey);
  //
  //       const marketplaceHash = selectedHash.replace("hash-", "");
  //
  //       const args = RuntimeArgs.fromMap({
  //         operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(marketplaceHash, "hex")))),
  //         token_id: CLValueBuilder.u64(selectedTokenId),
  //       });
  //
  //       const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "10000000000");
  //       console.log(deploy);
  //
  //       const deployJson = DeployUtil.deployToJson(deploy);
  //
  //       try {
  //         const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
  //         let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
  //         signedDeploy = DeployUtil.validateDeploy(signedDeploy);
  //         const data = DeployUtil.deployToJson(signedDeploy.val);
  //         const response = await axios.post(SERVER_API + "deploy", data, {
  //           headers: { "Content-Type": "application/json" },
  //         });
  //
  //         toastr.success(response.data, "Approve deployed successfully.");
  //         navigate("/marketplace");
  //       } catch (error: any) {
  //         alert(error.message);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toastr.error("error");
  //   }
  // };

  const install = async () => {
    setLoading(true);
    try {
      if (!disable) {

        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();

        const args = RuntimeArgs.fromMap({
          name: CLValueBuilder.string(raffle.name),
          start_date: CLValueBuilder.u64(raffle.start * 1000),
          end_date: CLValueBuilder.u64(raffle.end * 1000),
          collection: CasperHelpers.stringToKey(raffle.collectionHash),
          nft_index: CLValueBuilder.u64(raffle.nftIndex),
          price: CLValueBuilder.u512(raffle.price * 1000000000),
        });

        const deploy = contract.install(new Uint8Array(raffleWasm), args,"100000000000", ownerPublicKey, "casper-test")
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


    } catch (error) {
        console.log(error);
    }
  }

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
      if (selectedCollection) {
        const nftCollection = await getNftCollection(
            raffle.collectionHash
        );
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(
              getNftMetadata(raffle.collectionHash, index.toString())
          );
        }

        const nftMetas = await Promise.all(promises);
        setNfts(nftMetas);
        setLoadingNFT(false);
      }
    };

    init();
  }, [selectedCollection]);

  useEffect(() => {
    const init = async () => {
      setLoadingNFT(true);
      if (raffle.collectionHash && raffle.collectionHash != "") {
        const nftCollection = await getNftCollection(
          raffle.collectionHash
        );
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(
            getNftMetadata(raffle.collectionHash, index.toString())
          );
        }

        const nftMetas = await Promise.all(promises);
        setNfts(nftMetas);
        setLoadingNFT(false);
      }
    };

    init();
  }, [raffle.collectionHash]);

  useEffect(() => {
    const init = async () => {

      const data = await fetchRaffleNamedKeys(publicKey);
      console.log(data);

      const raffleDetailsPromises = data.map((rf:any) => getRaffleDetails(rf.key));

      const raffleDetails = await Promise.all(raffleDetailsPromises);
      console.log(raffleDetails)

     const finalData:any[] = raffleDetails.map((raffle:RaffleMetadata, index) => {
        return {
          key: data[index].key,
          collection: uint32ArrayToHex(raffle.collection),
          name: raffle.name,
          owner: uint32ArrayToHex(raffle.owner),
          nft_index: Number(raffle.nft_index.hex),
          start_date: Number(raffle.start_date.hex),
          end_date: Number(raffle.end_date.hex),
          price: Number(raffle.price.hex),
        }
      });

      console.log(finalData);
      setRaffles(finalData);
      setLoading(false);

    };
    init();
  }, []);

  const disable = useMemo(() => {
    const time: boolean = !(raffle.start >= raffle.end);
    const collection: boolean = !(raffle.collectionHash == "");
    const nft: boolean = !(raffle.nftIndex < 0)
    const price: boolean = !(raffle.price <= 0);
    const name: boolean = !(!raffle.name.length || raffle.name.startsWith(" "));
    return !(name && price && time && collection && nft);
  }, [raffle]);


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
          Active Raffles
        </Typography>
        <CustomButton
          disabled={false}
          label="Create new Raffle"
          onClick={() => handleOpen(setRaffleOpen)}
        ></CustomButton>
        <CreateRaffleModal
            raffle={raffle}
            createRaffle={() => install()}
            raffleOnChange={setRaffle}
            open={raffleOpen}
            onClose={() => handleClose(setRaffleOpen)}
            loadingCollection={loadingCollection}
            loadingNFT={loadingNFT}
            collections={collections}
            nfts={nfts}
            disable={disable}
        ></CreateRaffleModal>
      </Stack>
      <Grid
        container
        width={"100%"}
        display={"grid"}
        marginTop={"4rem"}
        className={classes.tab}
      >
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleTabChange} variant="fullWidth">
              <Tab label="my raffles" value="1" />
              <Tab label="join raffle" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
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
                        <TableCell key="raffle-actions" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                     {raffles && raffles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((raffle:any, index:number) => {
                       return (
                      <TableRow
                        style={{ cursor: "pointer" }}
                        onClick={() => {}}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={index}
                      >
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
                          <Typography color="#0f1429">{raffle.price / Math.pow(10,9)}</Typography>
                        </TableCell>
                          <TableCell align="left">
                              <IconButton onClick={(e:any) => {
                                handleMenuClick(e, setRaffleMore);
                                console.log(raffle)
                                setClickedRaffle(raffle);
                              }}>
                                <MoreVertIcon></MoreVertIcon>
                              </IconButton>
                              <Menu
                                  anchorEl={raffleMore}
                                  open={raffleMoreOpen}
                                  onClose={() => handleMenuClose(setRaffleMore)}
                                  anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                  }}
                                  transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                  }}
                              >
                                <MenuItem onClick={() => {
                                  handleOpen(setApproveModal);
                                  handleMenuClose(setRaffleMore);
                                  // setSelectedOperatorHash(row.key);
                                  console.log(index);
                                  console.log(raffle);
                                }}>Approve NFT</MenuItem>
                                <MenuItem onClick={() => handleMenuClose(setRaffleMore)}>Deposit NFT</MenuItem>
                                <MenuItem onClick={() => handleMenuClose(setRaffleMore)}>Detail Raffle</MenuItem>
                              </Menu>
                                <ApproveNFTModalonRaffePage
                                    open={approveModal}
                                    handleClose={() => handleClose(setApproveModal)}
                                    loadingCollection={loadingCollection}
                                    loadingNFT={loadingNFT}
                                    collections={collections}
                                    nfts={nfts}
                                    selectedCollection={selectedCollection ? selectedCollection : undefined}
                                    selectedNFTIndex={selectedTokenId}
                                    collectionOnChange={setSelectedCollection}
                                    nftOnChange={setSelectedTokenId}
                                    approve={()=> {
                                      console.log(raffle.name)}}
                                    selectedRaffle={clickedRaffle}
                                ></ApproveNFTModalonRaffePage>
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

          </TabPanel>
          <TabPanel value="2">
            {" "}
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
                            Start
                          </Typography>
                        </TableCell>
                        <TableCell key="decimal" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            End
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
                        <TableCell key="raffle-price" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            Status
                          </Typography>
                        </TableCell>
                        <TableCell key="raffle-actions" align="center">
                          <Typography fontWeight="bold" color="#0f1429">
                            Actions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    return (
                      <TableRow
                        style={{ cursor: "pointer" }}
                        onClick={() => window.open("https://testnet.cspr.live/contract/" + row.contractHash.slice(5), "_blank")}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={index}
                      >
                        <TableCell align="left">
                          <Typography color="#0f1429">{row.name}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{row.symbol}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{parseInt(row.decimals.hex, 16)}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{parseInt(row.total_supply.hex, 16) / Math.pow(10, parseInt(row.decimals.hex, 16))}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{parseInt(row.enable_mint_burn.hex, 16) ? "TRUE" : "FALSE"}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })} */}
                      <TableRow
                        style={{ cursor: "pointer" }}
                        onClick={() => {}}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                      >
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <CustomButton
                            label="buy ticket"
                            disabled={false}
                            onClick={() => {}}
                          ></CustomButton>
                        </TableCell>
                      </TableRow>
                      <TableRow
                        style={{ cursor: "pointer" }}
                        onClick={() => {}}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                      >
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">hahah</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <CustomButton
                            label="buy ticket"
                            disabled={false}
                            onClick={() => {}}
                          ></CustomButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* <TablePagination
              rowsPerPageOptions={[1, 5, 10]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            /> */}
              </Paper>
            </Grid>
          </TabPanel>
          {/* <TabPanel value="3">Item Three</TabPanel> */}
        </TabContext>
      </Grid>
    </Grid>
  );
};

export default ManageRaffle;
