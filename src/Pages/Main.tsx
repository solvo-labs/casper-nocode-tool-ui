import { CircularProgress, Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import casperWalletIcon from "../assets/casper-wallet-icon.svg";
import copyIcon from "../assets/copy-icon.png";
import casperLogo from "../assets/cspr_logo.svg";
import { makeStyles } from "@mui/styles";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchCep78NamedKeys, getNftCollection, getBalance, fetchAmount, initTokens } from "../utils/api";
import { CollectionMetada } from "../utils/types";
import CollectionCard from "../components/CollectionCard";
import { MY_ERC20TOKEN } from "../utils/enum";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  tableCard: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "10px !important",
  },
  buttonCard: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingTop: "20px !important",
    paddingBottom: "20px !important",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  walletSection: {
    display: "flex !important",
    justifyContent: "space-between !important",
    alignItems: "center !important",
  },
  walletPublicKey: {
    fontFamily: "monospace !important",
    fontSize: "14px !important",
  },
  walletBalance: {
    fontSize: "18px !important",
    fontWeight: "700 !important",
    color: "#fff !important",
  },
  headerText: {
    fontSize: "16px !important",
    fontWeight: "700 !important",
    color: "#fff !important",
  },
  walletCSPR: {
    fontSize: "18px !important",
    fontWeight: "700 !important",
    fontFamily: "monospace !important",
    color: "#fff !important",
  },
  walletCSPRGray: {
    fontSize: "18px !important",
    fontWeight: "700 !important",
    fontFamily: "monospace !important",
    color: "#A9A9A9",
  },
  tableStr: {
    fontSize: "16px !important",
    fontWeight: "500 !important",
    color: "#fff !important",
  },
  tableInt: {
    fontSize: "16px !important",
    fontWeight: "500 !important",
    fontFamily: "monospace !important",
    color: "#fff !important",
  },
  copyAnimationStart: {
    opacity: 1,
    transition: "opacity 0.1s ease-in-out !important",
  },
  copyAnimationEnd: {
    opacity: 0,
    transition: "opacity 0.1s ease-in-out !important",
  },
  button: {
    background: "linear-gradient(109deg, rgba(255, 0, 17, 0.27) 2.16%, rgba(255, 0, 17, 0.67) 100%)",
    strokeWidth: "0.379px",
    stroke: "rgba(255, 255, 255, 0.36)",
    filter: "drop-shadow(0px 1.5168195962905884px 9.10091781616211px rgba(0, 0, 0, 0.20))",
    backdropFilter: "blur(7.584097862243652px)",
    transition: "background-color 0.3s ease",
    "&:hover": {
      background: "#BF000C",
    },
  },
  tableContainer: {
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
  },
}));

const Main: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [collections, setCollections] = useState<CollectionMetada[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [CSPRPrice, setCSPRPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [myTokenList, setMyTokenList] = useState<any>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CEP-78 named keys
        const namedKeysData = await fetchCep78NamedKeys(publicKey);

        // Fetch NFT collections for each named key
        const collectionPromises = namedKeysData.map((data) => getNftCollection(data.key));
        const collectionsData = await Promise.all(collectionPromises);

        // Set collections state and loading to false
        setCollections(collectionsData);

        // Fetch balance
        const balanceData = await getBalance(publicKey);
        setBalance(balanceData);

        // Fetch CSPR price (assuming there's a fetchAmount function)
        const csprPriceData = await fetchAmount();
        setCSPRPrice(csprPriceData);

        // Fetch all Token data
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const accountHash = ownerPublicKey.toAccountHashStr();
        const { finalData: allData } = await initTokens(accountHash, publicKey);
        setMyTokenList(allData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [publicKey]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleCopyClick = (publicKey: string) => {
    const textToCopy = publicKey;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 100);
    });
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
    <Grid container spacing={2} style={{ width: "100vw", padding: "30px" }}>
      <Grid item xs={3}>
        <div className={classes.card} style={{ width: "370px !important", height: "375px !important" }}>
          <div className={classes.walletSection} style={{ marginBottom: "55px" }}>
            <img style={{ width: "125px" }} src={casperWalletIcon} alt="casper wallet icon" />
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <span className={classes.walletPublicKey}>{`${publicKey.replace(/^(.{4})(.*)(.{4})$/, "$1****$3")}`}</span>
              <img
                onClick={() => handleCopyClick(publicKey)}
                className={`${classes.copyAnimationStart} ${isCopied ? classes.copyAnimationEnd : ""}`}
                style={{ marginLeft: "5px", width: "20px", cursor: "pointer" }}
                src={copyIcon}
                alt="copy icon"
              />
            </div>
          </div>
          <div className={classes.walletSection}>
            <div className={classes.walletBalance}>Balance:</div>
            <div className={classes.walletCSPR} style={{ marginBottom: "10px !important" }}>
              {(parseInt(balance.hex) / Math.pow(10, 9)).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              CSPR
            </div>
          </div>
          <div className={classes.walletSection} style={{ justifyContent: "flex-end !important", marginBottom: "40px" }}>
            <div></div>
            <div className={classes.walletCSPR}>
              $
              {(CSPRPrice * (parseInt(balance.hex) / Math.pow(10, 9))).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <Divider sx={{ backgroundColor: "gray !important", marginBottom: "40px !important" }}></Divider>
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "20px" }}>
            <img src={casperLogo} alt="casper logo" />
            <div className={classes.walletBalance} style={{ marginLeft: "10px" }}>
              Casper
            </div>
            <div className={classes.walletCSPRGray} style={{ marginLeft: "5px" }}>
              CSPR
            </div>
          </div>
          <div className={classes.walletSection}>
            <div className={classes.walletBalance}>CSPR/USD:</div>
            <div className={classes.walletCSPR}>${CSPRPrice.toFixed(4)}</div>
          </div>
        </div>
      </Grid>
      <Grid item xs={6} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {myTokenList.lengt < 0 && (
          <div className={classes.tableCard} style={{ width: "585px", height: "375px !important", marginBottom: "30px" }}>
            <div className={classes.walletBalance} style={{ paddingLeft: "1rem", paddingBottom: "1rem" }}>
              My Tokens
            </div>
            {
              <div>
                <TableContainer className={classes.tableContainer}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell key="name" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.NAME}
                          </Typography>
                        </TableCell>
                        <TableCell key="symbol" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.SYMBOL}
                          </Typography>
                        </TableCell>
                        <TableCell key="decimal" align="center">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.DECIMAL}
                          </Typography>
                        </TableCell>
                        <TableCell key="balance" align="center">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.BALANCE}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myTokenList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            onClick={() => window.open("https://testnet.cspr.live/contract/" + row.contractHash, "_blank")}
                            tabIndex={-1}
                            key={index}
                            style={{ cursor: "pointer" }}
                          >
                            <TableCell align="left">
                              <Typography className={classes.tableStr}>{row.name}</Typography>
                            </TableCell>
                            <TableCell align="left">
                              <Typography className={classes.tableStr}>{row.symbol}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography className={classes.tableInt}>{row.decimals}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography className={classes.tableInt}>{row.balance}</Typography>
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
                  count={myTokenList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ color: "#fff !important", "& .MuiSvgIcon-root": { fill: "#fff !important" } }}
                />
              </div>
            }
          </div>
        )}
        <div className={classes.tableCard} style={{ width: "585px", height: "375px !important" }}>
          <div className={classes.walletBalance} style={{ paddingLeft: "1rem", paddingBottom: "1rem" }}>
            My Collections
          </div>
          <div>
            <Grid container width={"100%"} justifyContent={"flex-start"}>
              {collections.slice(0, 6).map((e: any, index: number) => (
                <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                  <CollectionCard
                    image={"/images/casper.png"}
                    onClick={() => navigate("/nft-list/" + e.contractHash)}
                    title={e.collection_name}
                    contractHash={e.contractHash}
                    symbol={e.collection_symbol}
                    cardHeight={"15rem"}
                    mediaHeight={"100px"}
                    cardContentPadding={"5px"}
                    cardContentTitle={"14px"}
                    cardContentSymbol={"14px"}
                    cardContentContractHash={"12px"}
                    tokenCountText={parseInt(e.number_of_minted_tokens.hex).toString() + "/" + parseInt(e.total_token_supply.hex).toString()}
                  ></CollectionCard>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </Grid>

      <Grid item xs={3}>
        <div className={`${classes.buttonCard}`} style={{ width: "250px !important", marginBottom: "30px" }}>
          <div className={classes.walletBalance} style={{ marginBottom: "20px" }}>
            Wanna create a new Token?
          </div>
          <button
            onClick={() => {
              navigate("/token");
            }}
            className={classes.button}
          >
            Create Token
          </button>
        </div>
        <div className={`${classes.buttonCard}`} style={{ width: "250px !important" }}>
          <div className={classes.walletBalance} style={{ marginBottom: "20px" }}>
            Wanna create a new NFT?
          </div>
          <button
            onClick={() => {
              navigate("/create-nft");
            }}
            className={classes.button}
          >
            Create NFT
          </button>
        </div>
      </Grid>
    </Grid>
  );
};

export default Main;
