import { CircularProgress, Divider, Grid, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import casperWalletIcon from "../assets/casper-wallet-icon.svg";
import copyIcon from "../assets/copy-icon.png";
import casperLogo from "../assets/cspr_logo.svg";
import { makeStyles } from "@mui/styles";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchCep78NamedKeys, getNftCollection, getBalance, fetchAmount } from "../utils/api";
import { CollectionMetada } from "../utils/types";
import { getMetadataImage } from "../utils";
import CollectionCard from "../components/CollectionCard";
import { FETCH_IMAGE_TYPE } from "../utils/enum";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    // marginLeft: "40px !important",
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
    // marginLeft: "40px !important",
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
}));

const Main: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [CSPRPrice, setCSPRPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch CEP-78 named keys
        const namedKeysData = await fetchCep78NamedKeys(publicKey);

        // Fetch NFT collections for each named key
        const collectionPromises = namedKeysData.map((data) => getNftCollection(data.key));
        const collectionsData = await Promise.all(collectionPromises);

        // Fetch images for collections
        const imagePromises = collectionsData.map((e: any) => getMetadataImage(e.json_schema, FETCH_IMAGE_TYPE.COLLECTION));
        const images = await Promise.all(imagePromises);

        // Combine collection data with images
        const finalData = collectionsData.map((e: any, index: number) => ({
          ...e,
          image: images[index],
        }));

        // Set collections state and loading to false
        setCollections(finalData);

        // Fetch balance
        const balanceData = await getBalance(publicKey);
        setBalance(balanceData);

        // Fetch CSPR price (assuming there's a fetchAmount function)
        const csprPriceData = await fetchAmount();
        setCSPRPrice(csprPriceData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [publicKey]);

  // useEffect(() => {
  //   const init = async () => {
  //     const data = await fetchCep78NamedKeys(publicKey);

  //     const promises = data.map((data) => getNftCollection(data.key));

  //     const result = await Promise.all(promises);
  //     const imagePromises = result.map((e: any) => getMetadataImage(e.json_schema, FETCH_IMAGE_TYPE.COLLECTION));
  //     const images = await Promise.all(imagePromises);
  //     const finalData = result.map((e: any, index: number) => {
  //       return {
  //         ...e,
  //         image: images[index],
  //       };
  //     });

  //     setLoading(false);
  //     console.log(finalData);
  //     setCollections(finalData);
  //   };

  //   init();
  // }, []);

  // useEffect(() => {
  //   const balance = async () => {
  //     const data = await getBalance(publicKey);
  //     console.log("data", data);
  //     setBalance(data);
  //   };

  //   balance();
  // }, []);

  // useEffect(() => {
  //   const amount = async () => {
  //     const data = await fetchAmount();
  //     console.log(data);
  //     setCSPRPrice(data);
  //   };

  //   amount();
  // }, []);

  const tableData = [
    { name: "Deneme", symbol: "Örnek 1", decimal: 8, balance: 20 },
    { name: "Deneme", symbol: "Örnek 2", decimal: 8, balance: 20 },
    { name: "Deneme", symbol: "Örnek 3", decimal: 8, balance: 20 },
    { name: "Deneme", symbol: "Örnek 4", decimal: 8, balance: 20 },
    { name: "Deneme", symbol: "Örnek 5", decimal: 8, balance: 20 },
  ];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCopyClick = () => {
    const textToCopy = "Hf8SzL3ztwWk594B7Kwo";
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
    <Grid container spacing={2} style={{ width: "100vw" }}>
      <Grid item xs={3}>
        <div className={classes.card} style={{ width: "370px !important", height: "375px !important" }}>
          <div className={classes.walletSection} style={{ marginBottom: "55px" }}>
            <img style={{ width: "125px" }} src={casperWalletIcon} alt="casper wallet icon" />
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <span className={classes.walletPublicKey}>{`${publicKey.replace(/^(.{4})(.*)(.{4})$/, "$1****$3")}`}</span>
              <img
                onClick={handleCopyClick}
                className={`${classes.copyAnimationStart} ${isCopied ? classes.copyAnimationEnd : ""}`}
                style={{ marginLeft: "5px", width: "20px" }}
                src={copyIcon}
                alt="copy icon"
              />
            </div>
          </div>
          <div className={classes.walletSection}>
            <div className={classes.walletBalance}>Balance:</div>
            <div className={classes.walletCSPR} style={{ marginBottom: "10px !important" }}>
              {parseInt(balance.hex) / Math.pow(10, 9)} CSPR
            </div>
          </div>
          <div className={classes.walletSection} style={{ justifyContent: "flex-end !important", marginBottom: "40px" }}>
            <div></div>
            <div className={classes.walletCSPR}>${CSPRPrice}</div>
          </div>
          <Divider sx={{ backgroundColor: "red !important", marginBottom: "40px !important" }}></Divider>
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
            <div className={classes.walletCSPR}>$0.03115</div>
          </div>
        </div>
      </Grid>
      <Grid item xs={6} style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div className={classes.tableCard} style={{ width: "585px", height: "375px !important" }}>
          <div className={classes.walletBalance} style={{ paddingLeft: "1rem", paddingBottom: "1rem" }}>
            My Tokens
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerText} style={{ textAlign: "left" }}>
                  Name
                </TableCell>
                <TableCell className={classes.headerText} style={{ textAlign: "left" }}>
                  Symbol
                </TableCell>
                <TableCell className={classes.headerText} style={{ textAlign: "center" }}>
                  Decimal
                </TableCell>
                <TableCell className={classes.headerText} style={{ textAlign: "center" }}>
                  Balance
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index: number) => (
                <TableRow key={index}>
                  <TableCell className={classes.tableStr} style={{ textAlign: "left" }}>
                    {row.name}
                  </TableCell>
                  <TableCell className={classes.tableStr} style={{ textAlign: "left" }}>
                    {row.symbol}
                  </TableCell>
                  <TableCell className={classes.tableInt} style={{ textAlign: "center" }}>
                    {row.decimal}
                  </TableCell>
                  <TableCell className={classes.tableInt} style={{ textAlign: "center" }}>
                    {row.balance}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: "#fff !important", "& .MuiSvgIcon-root": { fill: "#fff !important" } }}
          />
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className={classes.buttonCard} style={{ width: "250px !important" }}>
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
      </Grid>
      <Grid item xs={3}></Grid>
      <Grid item xs={6} style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div className={classes.tableCard} style={{ width: "585px", height: "375px !important" }}>
          <div className={classes.walletBalance} style={{ paddingLeft: "1rem", paddingBottom: "1rem" }}>
            My Collections
          </div>
          <div>
            <Grid container width={"100%"} justifyContent={"flex-start"}>
              {collections.concat(collections).map((e: any, index: number) => (
                <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                  <CollectionCard
                    image={e.image}
                    onClick={() => navigate("/nft-list/" + e.contractHash)}
                    title={e.collection_name}
                    contractHash={e.contractHash}
                    symbol={e.collection_symbol}
                  ></CollectionCard>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className={classes.buttonCard} style={{ width: "250px !important" }}>
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
