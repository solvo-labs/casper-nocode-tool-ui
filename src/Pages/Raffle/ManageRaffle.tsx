import {
  Box,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Modal,
  Paper,
  SelectChangeEvent,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Theme,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import {
  fetchCep78NamedKeys,
  getNftCollection,
  getNftMetadata,
} from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { CollectionMetada, NFT, Raffle } from "../../utils/types";
import { CustomSelect } from "../../components/CustomSelect";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CustomDateTime } from "../../components/CustomDateTime";
import moment, { Moment } from "moment";
import { TabContext, TabList, TabPanel } from "@mui/lab";

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
  const [open, setOpen] = useState(false);
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingNft, setLoadingNft] = useState<boolean>(true);
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nfts, setNfts] = useState<NFT[] | any>([]);
  const [tabValue, setTabValue] = useState("1");

  const [selectedCollection, setSelectedCollection] =
    useState<CollectionMetada>();
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<
    number | undefined
  >();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const [raffle, setRaffle] = useState<Raffle>({
    collectionHash: "",
    nftIndex: 0,
    start: moment().unix(),
    end: moment().unix(),
    price: 0,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);

      setLoading(false);
      console.log(result);
      setCollections(result);
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoadingNft(true);
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
        setLoadingNft(false);
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
          onClick={handleOpen}
        ></CustomButton>
        <Modal className={classes.modalStyle} open={open} onClose={handleClose}>
          <Box sx={style}>
            {loading ? (
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
                <Grid item>
                  <Typography className={classes.title} variant="h6">
                    Create new raffle
                  </Typography>
                </Grid>
                <Stack marginTop={"2rem"} spacing={4}>
                  <CustomSelect
                    value={selectedCollection?.contractHash || "default"}
                    id="customselect"
                    onChange={(event: SelectChangeEvent) => {
                      const data = collections.find(
                        (tk: any) => tk.contractHash === event.target.value
                      );
                      setSelectedCollection(data);
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
                  {loadingNft ? (
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
                        setSelectedNFTIndex(event.target.value);
                      }}
                    >
                      <MenuItem
                        key={"default"}
                        value={"default"}
                        onChange={() => setSelectedNFTIndex(undefined)}
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
                      setRaffle({ ...raffle, price: e.target.value })
                    }
                    placeholder="Price"
                    type="number"
                    value={raffle.price}
                    disable={false}
                  ></CustomInput>
                  <Grid item>
                    <CustomDateTime
                      // label="startRaffle"
                      firstLabel="Pick start date"
                      secondLabel="Pick start time"
                      onChange={(e: Moment) =>
                        setRaffle({ ...raffle, start: e.unix() })
                      }
                      value={raffle.start}
                    />
                  </Grid>
                  <Grid item>
                    <CustomDateTime
                      firstLabel="Pick end date"
                      secondLabel="Pick end time"
                      onChange={(e: Moment) =>
                        setRaffle({ ...raffle, end: e.unix() })
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
        </Modal>
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
                            label="Pick Winner"
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
                            label="Pick Winner"
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
