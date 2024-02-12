import { CircularProgress, Grid, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchCep78NamedKeys, getNftCollection, getBalance, fetchAmount, initTokens } from "../utils/api";
import { CollectionMetada } from "../utils/types";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import WalletCard from "../components/WalletCard";
import CollectionListMainMenu from "../components/CollectionListMainMenu";
import TokenListMainMenu from "../components/TokenListMainMenu";
import CreateSomething from "../components/CreateSomething";

const useStyles = makeStyles(() => ({
  container: {
    minWidth: "80vw",
    maxWidth: "80vw",
    marginBottom: "4rem",
  },
}));

const Main: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [collections, setCollections] = useState<CollectionMetada[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [CSPRPrice, setCSPRPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [myTokenList, setMyTokenList] = useState<any>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [copyTooltip, setCopyTooltip] = useState<boolean>(false);

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
        const balanceFix = parseInt(balanceData.hex) / Math.pow(10, 9);
        setBalance(balanceFix);

        // Fetch CSPR price (assuming there's a fetchAmount function)
        const csprPriceData = await fetchAmount();
        setCSPRPrice(csprPriceData);
        // console.log(typeof csprPriceData);

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

    const interval = setInterval(() => fetchData(), 30000);

    return () => {
      clearInterval(interval);
    };
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
      setCopyTooltip(true);

      setTimeout(() => {
        setCopyTooltip(false);
      }, 1000);
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
    <Grid container spacing={4} className={classes.container}>
      <Grid item xl={4} lg={5} md={12} sm={12} xs={12}>
        <Stack spacing={4}>
          <WalletCard handleClick={() => handleCopyClick(publicKey)} tooltip={copyTooltip} publicKey={publicKey} casperBalance={balance} CSPRPrice={CSPRPrice}></WalletCard>
          <CreateSomething handleClick={() => navigate("/token")} title="Token"></CreateSomething>
          <CreateSomething handleClick={() => navigate("/create-nft")} title="NFT"></CreateSomething>
        </Stack>
      </Grid>
      <Grid item xl={8} lg={7} md={12} sm={12} xs={12}>
        <Stack spacing={4}>
          <CollectionListMainMenu
            handleCollectionDetail={(contractHash) => navigate("/nft-list/" + contractHash)}
            handleCreateCollection={() => navigate("/create-collection")}
            collections={collections}
          ></CollectionListMainMenu>
          <TokenListMainMenu
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={() => handleChangePage}
            handleChangeRowsPerPage={() => handleChangeRowsPerPage}
            tokens={myTokenList}
          ></TokenListMainMenu>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Main;
