import {
  Box,
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
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import {
  fetchCep78NamedKeys,
  getNftCollection,
  getNftMetadata, SERVER_API,
} from "../../utils/api";
import {useNavigate, useOutletContext} from "react-router-dom";
import {CollectionMetada, NFT, Raffle} from "../../utils/types";
import moment from "moment";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateRaffleModal from "../../components/CreateRaffleModal.tsx";
import {CollectionCardAlternate} from "../../components/CollectionCard.tsx";
import {getMetadataImage} from "../../utils";
import {FETCH_IMAGE_TYPE} from "../../utils/enum.ts";
// @ts-ignore
import {CLByteArray, CLKey, CLPublicKey, CLValueBuilder, Contracts, DeployUtil, RuntimeArgs} from "casper-js-sdk";
import axios from "axios";
import toastr from "toastr";
import {ApproveNFTModalonRaffePage} from "../../components/NFTApproveModal.tsx";
import approve from "../Token/Approve.tsx";


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
  const navigate = useNavigate();
  const [publicKey, provider] = useOutletContext<[publicKey: string, provider: any]>();

  const [raffleOpen, setRaffleOpen] = useState<boolean>(false);
  const [approveModal, setApproveModal] = useState<boolean>(false);

  const [loadingCollection, setLoadingCollection] = useState<boolean>(false);
  const [loadingNFT, setLoadingNFT] = useState<boolean>(true);

  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nfts, setNfts] = useState<NFT[] | any>([]);

  const [tabValue, setTabValue] = useState("1");

  const [raffleMore, setRaffleMore] = useState<null | HTMLElement>(null);
  const raffleMoreOpen = Boolean(raffleMore);


  const [selectedCollection, setSelectedCollection] =
    useState<CollectionMetada>();
  const [selectedTokenId, setSelectedTokenId] = useState<number | undefined>();

  // const [listOfApprovable, setListOfApprovable] = useState<any[]>();

  const [raffle, setRaffle] = useState<Raffle>({
    collectionHash: "",
    nftIndex: 0,
    start: moment().unix(),
    end: moment().unix(),
    price: 0,
  });

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

  const fetchNft = async (contract: string) => {
    setLoadingNFT(true);
    if (contract) {
      const nftCollection = await getNftCollection(contract);

      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(contract, index.toString()));
      }

      const nftMetas= await Promise.all(promises);
      const imagePromises = nftMetas.map((e: any) => getMetadataImage(e, FETCH_IMAGE_TYPE.NFT));
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      nfts(finalData);
      setLoadingNFT(false);
    }
  };

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

  useEffect(() => {
    setLoadingCollection(true);
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);

      setLoadingCollection(false);
      console.log(result);
      setCollections(result);
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoadingNFT(true);
      if (selectedCollection?.contractHash) {
        const nftCollection = await getNftCollection(
          selectedCollection?.contractHash
        );
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(
            getNftMetadata(selectedCollection.contractHash, index.toString())
          );
        }

        const nftMetas = await Promise.all(promises);
        setNfts(nftMetas);
        console.log(nftMetas);
        setLoadingNFT(false);
      }
    };

    init();
  }, [selectedCollection]);

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
            open={raffleOpen}
            onClose={() => handleClose(setRaffleOpen)}
            loadingCollection={loadingCollection}
            loadingNFT={loadingNFT}
            collections={collections}
            nfts={nfts}
            selectedCollection={selectedCollection ? selectedCollection : undefined}
            selectedNFTIndex={selectedTokenId}
            collectionOnChange={setCollections}
            raffleOnChange={setRaffle}
            nftOnChange={setNfts}
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
                        <TableCell key="raffle-actions" align="left">
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
                        <TableCell align="left">
                            <IconButton onClick={(e:any) => handleMenuClick(e,setRaffleMore)}>
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
                                    console.log(selectedTokenId)}}
                              ></ApproveNFTModalonRaffePage>
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
