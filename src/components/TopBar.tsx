import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { APP_NAME, MARKETPLACE_PAGE, NFT_PAGE, PAGES_NAME, RAFFLE_PAGE, STAKE_PAGE, TOKEN_PAGE, TOKENOMICS_PAGE } from "../utils/enum";
import { AppBar, Avatar, Box, Button, Container, Divider, Grid, IconButton, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@mui/material";
import { AccountMenuItem, CopyHashMenuItem, ViewAccountOnExplorerMenuItem } from "@make-software/csprclick-ui";
import { CSPRClickSDK } from "@make-software/csprclick-core-client";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: "#0F1429 !important",
    padding: "2rem",
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  appName: {
    mr: 2,
    display: "flex",
    flexGrow: 1,
    fontWeight: "700 !important",
    letterSpacing: ".3rem !important",
    color: "#FFFFFF",
    "&:hover": {
      color: "#FF0011",
    },
  },
  menuTitle: {
    my: 2,
    color: "white !important",
    display: "block",
    fontWeight: "500 !important",
    borderBottom: "1px solid #FF0011 !important",
    marginRight: "0.5rem !important",
  },
  menuItem: {
    display: "flex",
    width: "100%",
    "&:hover": {
      color: "#FF0011 !important",
      backgroundColor: "#131933 !important",
    },
  },
}));

type Props = {
  publicKey: string;
  clickRef: CSPRClickSDK | undefined;
};

const TopBar: React.FC<Props> = ({ publicKey, clickRef }) => {
  const [stakeAnchorEl, setAnchorElStake] = React.useState<null | HTMLElement>(null);
  const openStake = Boolean(stakeAnchorEl);
  const [nftAnchorEl, setAnchorElForNFT] = React.useState<null | HTMLElement>(null);
  const openNFT = Boolean(nftAnchorEl);
  const [tokenAnchorEl, setAnchorElForToken] = React.useState<null | HTMLElement>(null);
  const openToken = Boolean(tokenAnchorEl);
  const [tokenomicsAnchorEl, setAnchorElForTokenomics] = React.useState<null | HTMLElement>(null);
  const openTokenomics = Boolean(tokenomicsAnchorEl);
  const [marketplaceAnchorEl, setAnchorElForMarketplace] = React.useState<null | HTMLElement>(null);
  const openMarketplace = Boolean(marketplaceAnchorEl);
  const [raffleAnchorEl, setAnchorElForRaffle] = React.useState<null | HTMLElement>(null);
  const openRaffle = Boolean(raffleAnchorEl);
  const [anchorElForProfile, setAnchorElForProfile] = React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);
  const classes = useStyles();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>, setState: any) => {
    setState(event.currentTarget);
  };

  const logout = async () => {
    // clickRef?.disconnect();
    clickRef?.signOut();
    navigate("/login");
    window.location.reload();
  };

  const switch_account = async () => {
    const activeAccount = clickRef?.getActiveAccount();
    if (activeAccount?.provider) {
      await clickRef?.switchAccount(activeAccount?.provider);
    }
    window.location.reload();
  };

  const handleRouter = (a: any) => {
    if (a === TOKEN_PAGE.TOKEN_MINT) {
      navigate("/token");
    } else if (a === TOKEN_PAGE.MY_TOKENS) {
      navigate("/my-tokens");
    } else if (a === TOKEN_PAGE.TRANSFER) {
      navigate("transfer");
    } else if (a === TOKEN_PAGE.TRANSFER_FROM) {
      navigate("/transfer-from");
    } else if (a === TOKEN_PAGE.APPROVE) {
      navigate("/approve");
    } else if (a === TOKEN_PAGE.MINT_AND_BURN) {
      navigate("/mint-and-burn");
    } else if (a === TOKEN_PAGE.ALLOWANCE) {
      navigate("/allowance");
    } else if (a === TOKEN_PAGE.INCREASE_DECREASE_ALLOWANCE) {
      navigate("/increase-decrease-allowance");
    } else if (a === NFT_PAGE.MY_COLLECTIONS) {
      navigate("/my-collections");
    } else if (a === NFT_PAGE.CREATE_COLLECTION) {
      navigate("/create-collection");
    } else if (a === NFT_PAGE.CREATE_NFT) {
      navigate("/create-nft");
    } else if (a === NFT_PAGE.APPROVE_NFT) {
      navigate("/approve-nft");
    } else if (a === NFT_PAGE.CREATE_LOOTBOX) {
      navigate("/create-lootbox");
    } else if (a === NFT_PAGE.MY_LOOTBOXES) {
      navigate("/my-lootboxes");
    } else if (a === NFT_PAGE.MERGE_NFT) {
      navigate("/merge-nft");
    } else if (a === NFT_PAGE.TIMEABLE_NFTS) {
      navigate("/timeable-nfts");
    } else if (a === TOKENOMICS_PAGE.CREATE_TOKENOMICS) {
      navigate("/tokenomics");
    } else if (a === TOKENOMICS_PAGE.MANAGE_TOKENOMICS) {
      navigate("/vesting-list");
    } else if (a === MARKETPLACE_PAGE.CREATE_MARKETPLACE) {
      navigate("/create-marketplace");
    } else if (a === MARKETPLACE_PAGE.LIST_MARKETPLACE) {
      navigate("/marketplace");
    } else if (a === MARKETPLACE_PAGE.BUY_NFT) {
      navigate("/buy-nft");
    } else if (a === MARKETPLACE_PAGE.BUY_LOOTBOX) {
      navigate("/buy-lootbox");
    } else if (a === MARKETPLACE_PAGE.JOIN_RAFFLE) {
      navigate("/join-raffle");
    } else if (a === RAFFLE_PAGE.MANAGE_RAFFLE) {
      navigate("/manage-raffle");
    } else if (a === STAKE_PAGE.STAKTE_CASPER) {
      navigate("stake-casper");
    } else if (a === STAKE_PAGE.STAKE_TOKEN) {
      navigate("/stake-cep18-token");
    } else if (a === STAKE_PAGE.MANAGE_STAKE) {
      navigate("/manage-stake");
    } else if (a === STAKE_PAGE.JOIN_STAKES) {
      navigate("/join-stakes");
    }

    setAnchorElForNFT(null);
    setAnchorElForToken(null);
    setAnchorElForTokenomics(null);
    setAnchorElForProfile(null);
    setAnchorElForMarketplace(null);
    setAnchorElForRaffle(null);
    setAnchorElStake(null);
  };

  useEffect(() => {
    clickRef?.on("csprclick:disconnected", async () => {
      navigate("/login");
    });
  }, []);

  const listMenuItem = (pages: object) => {
    const value = Object.values(pages);
    return value.map((a: any) => (
      <MenuItem key={a} onClick={() => handleRouter(a)} className={classes.menuItem}>
        {a}
      </MenuItem>
    ));
  };

  return (
    <div>
      <AppBar className={classes.appBar}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* ICON */}
            {/* <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} /> */}
            <Typography variant="h5" noWrap component="a" href="" className={classes.appName} onClick={() => navigate("/")}>
              {APP_NAME.CASPER}
            </Typography>
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <Box>
                <Button
                  onClick={(e: any) => handleClick(e, setAnchorElStake)}
                  onMouseOver={(e: any) => handleClick(e, setAnchorElStake)}
                  onMouseOut={(e: any) => handleClick(e, setAnchorElStake)}
                >
                  <Typography className={classes.menuTitle}>{PAGES_NAME.STAKE}</Typography>
                </Button>
                <Menu
                  id="nftMenu"
                  anchorEl={stakeAnchorEl}
                  open={openStake}
                  onClose={() => setAnchorElStake(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(STAKE_PAGE)}
                </Menu>
              </Box>
              <Box>
                <Button
                  onClick={(e: any) => handleClick(e, setAnchorElForNFT)}
                  onMouseOver={(e: any) => handleClick(e, setAnchorElForNFT)}
                  onMouseOut={(e: any) => handleClick(e, setAnchorElForNFT)}
                >
                  <Typography className={classes.menuTitle}>{PAGES_NAME.NFT}</Typography>
                </Button>
                <Menu
                  id="nftMenu"
                  anchorEl={nftAnchorEl}
                  open={openNFT}
                  onClose={() => setAnchorElForNFT(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(NFT_PAGE)}
                </Menu>
              </Box>
              <Box>
                <Button
                  onClick={(e: any) => handleClick(e, setAnchorElForRaffle)}
                  onMouseOver={(e: any) => handleClick(e, setAnchorElForRaffle)}
                  onMouseOut={(e: any) => handleClick(e, setAnchorElForRaffle)}
                >
                  <Typography className={classes.menuTitle}>{PAGES_NAME.RAFFLE}</Typography>
                </Button>
                <Menu
                  id="raffleMenu"
                  anchorEl={raffleAnchorEl}
                  open={openRaffle}
                  onClose={() => setAnchorElForRaffle(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(RAFFLE_PAGE)}
                </Menu>
              </Box>
              <Box>
                <Button onClick={(e: any) => handleClick(e, setAnchorElForToken)} onMouseOver={(e: any) => handleClick(e, setAnchorElForToken)}>
                  <Typography className={classes.menuTitle}>{PAGES_NAME.TOKEN}</Typography>
                </Button>
                <Menu
                  id="collectionMenu"
                  anchorEl={tokenAnchorEl}
                  open={openToken}
                  onClose={() => setAnchorElForToken(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(TOKEN_PAGE)}
                </Menu>
              </Box>
              <Box>
                <Button onClick={(e: any) => handleClick(e, setAnchorElForTokenomics)} onMouseOver={(e: any) => handleClick(e, setAnchorElForTokenomics)}>
                  <Typography className={classes.menuTitle}>{PAGES_NAME.TOKENOMICS}</Typography>
                </Button>
                <Menu
                  id="tokenomicsMenu"
                  anchorEl={tokenomicsAnchorEl}
                  open={openTokenomics}
                  onClose={() => setAnchorElForTokenomics(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(TOKENOMICS_PAGE)}
                </Menu>
              </Box>
              <Box>
                <Button onClick={(e: any) => handleClick(e, setAnchorElForMarketplace)} onMouseOver={(e: any) => handleClick(e, setAnchorElForMarketplace)}>
                  <Typography className={classes.menuTitle}>{PAGES_NAME.MARKETPLACE}</Typography>
                </Button>
                <Menu
                  id="marketplaceMenu"
                  anchorEl={marketplaceAnchorEl}
                  open={openMarketplace}
                  onClose={() => setAnchorElForMarketplace(null)}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      background: "#0F1429",
                      color: "#FFFFFF",
                      border: "1px solid #FF0011",
                    },
                  }}
                >
                  {listMenuItem(MARKETPLACE_PAGE)}
                </Menu>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile">
                <IconButton onClick={(e: any) => handleClick(e, setAnchorElForProfile)} onMouseOver={(e: any) => handleClick(e, setAnchorElForProfile)} sx={{ p: 0 }}>
                  <Avatar alt="alt" src="" />
                </IconButton>
              </Tooltip>
              <Menu
                id="profile-menu"
                aria-labelledby="profile-menu"
                anchorEl={anchorElForProfile}
                open={openForProfile}
                onClose={() => setAnchorElForProfile(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                sx={{
                  marginTop: "1rem",
                  "& .MuiPaper-root": {
                    background: "#0F1429",
                    color: "#FFFFFF",
                    border: "1px solid #FF0011",
                  },
                }}
              >
                <Grid sx={{ display: "flex", padding: "12px 24px", alignItems: "center" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" height={"14px"} width={"14px"} viewBox="0 0 512 512" style={{ marginRight: "8px" }}>
                    <path
                      fill="#8FA6FF"
                      d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H448c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zM416 272a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                    />
                  </svg>
                  <Typography style={{ fontSize: "14px", color: "#D2DCE5" }}>{publicKey.slice(0, 5) + "..." + publicKey.slice(-6)}</Typography>
                </Grid>
                <Divider sx={{ backgroundColor: "#D2DCE5 !important", marginLeft: "0.75rem", marginRight: "0.75rem", marginBottom: "0.5rem" }} />
                <Grid sx={{ padding: "0 0.5rem 0 0.5rem" }}>
                  <ViewAccountOnExplorerMenuItem />
                  <CopyHashMenuItem
                    sx={{ width: "100% !important" }}
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation();
                      navigator.clipboard.writeText(publicKey);
                    }}
                  />
                  <AccountMenuItem
                    onClick={switch_account}
                    icon={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160H352c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96h32V64c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V416H352c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8h32V320c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z"/></svg>`}
                    label={"Switch Account"}
                  />
                  <AccountMenuItem
                    onClick={logout}
                    icon={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg>`}
                    label={"Logout"}
                    // badge={{ title: "new", variation: "green" }}
                  />
                </Grid>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default TopBar;
