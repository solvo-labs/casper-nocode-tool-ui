import React from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import {
  APP_NAME,
  MARKETPLACE_PAGE,
  NFT_PAGE,
  PAGES_NAME,
  TOKEN_PAGE,
  TOKENOMICS_PAGE,
} from "../utils/enum";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

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
    "&:hover": {
      color: "#FF0011 !important",
      backgroundColor: "#131933 !important",
    },
  },
}));

type Props = {
  publicKey: string;
};

const TopBar: React.FC<Props> = ({ publicKey }) => {
  const [nftAnchorEl, setAnchorElForNFT] = React.useState<null | HTMLElement>(
    null
  );
  const openNFT = Boolean(nftAnchorEl);
  const [tokenAnchorEl, setAnchorElForToken] =
    React.useState<null | HTMLElement>(null);
  const openToken = Boolean(tokenAnchorEl);
  const [tokenomicsAnchorEl, setAnchorElForTokenomics] =
    React.useState<null | HTMLElement>(null);
  const openTokenomics = Boolean(tokenomicsAnchorEl);
  const [marketplaceAnchorEl, setAnchorElForMarketplace] =
    React.useState<null | HTMLElement>(null);
  const openMarketplace = Boolean(marketplaceAnchorEl);
  const [anchorElForProfile, setAnchorElForProfile] =
    React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);
  const classes = useStyles();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>, setState: any) => {
    setState(event.currentTarget);
  };

  // function tokenMint() {
  //   navigate("/token");
  //   setAnchorEl(null);
  // }

  // const myTokens = () => {
  //   navigate("/my-tokens");
  //   setAnchorEl(null);
  // };

  // const transfer = () => {
  //   navigate("/transfer");
  //   setAnchorEl(null);
  // };

  // const approve = () => {
  //   navigate("/approve");
  //   setAnchorEl(null);
  // };

  // const mintAndBurn = () => {
  //   navigate("/mint-and-burn");
  //   setAnchorEl(null);
  // };

  // const allowance = () => {
  //   navigate("/allowance");
  //   setAnchorEl(null);
  // };

  // const increaseDecreaseAllowance = () => {
  //   navigate("/increase-decrease-allowance");
  //   setAnchorEl(null);
  // };

  // const transferFrom = () => {
  //   navigate("/transfer-from");
  //   setAnchorEl(null);
  // };

  const logout = async () => {
    const CasperWalletProvider = window.CasperWalletProvider;
    const provider = CasperWalletProvider();

    const disconnectFromSite = await provider.disconnectFromSite();

    if (disconnectFromSite) {
      navigate("/login");
      setAnchorElForProfile(null);
    }
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
    } else if (a === TOKENOMICS_PAGE.CREATE_TOKENOMICS) {
      navigate("/tokenomics");
    } else if (a === TOKENOMICS_PAGE.MANAGE_TOKENOMICS) {
      navigate("/vesting-list");
    } else if (a === MARKETPLACE_PAGE.CREATE_MARKETPLACE) {
      navigate("/create-marketplace");
    } else if (a === MARKETPLACE_PAGE.LIST_MARKETPLACE) {
      navigate("/marketplace")
    }
    setAnchorElForNFT(null);
    setAnchorElForToken(null);
    setAnchorElForTokenomics(null);
    setAnchorElForProfile(null);
    setAnchorElForMarketplace(null);
  };

  const listMenuItem = (pages: object) => {
    const value = Object.values(pages);
    return value.map((a: any) => (
      <MenuItem
        key={a}
        onClick={() => handleRouter(a)}
        className={classes.menuItem}
      >
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
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              className={classes.appName}
              onClick={() => navigate("/")}
            >
              {APP_NAME.CASPER}
            </Typography>
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <Button onClick={() => {}}>
                <Typography className={classes.menuTitle}>
                  {PAGES_NAME.STAKING}
                </Typography>
              </Button>
              <Button onClick={() => {}}>
                <Typography className={classes.menuTitle}>
                  {PAGES_NAME.DAO}
                </Typography>
              </Button>
              <Box>
                <Button
                  onClick={(e: any) => handleClick(e, setAnchorElForNFT)}
                  onMouseOver={(e: any) => handleClick(e, setAnchorElForNFT)}
                  onMouseOut={(e: any) => handleClick(e, setAnchorElForNFT)}
                >
                  <Typography className={classes.menuTitle}>
                    {PAGES_NAME.NFT}
                  </Typography>
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
                  onClick={(e: any) => handleClick(e, setAnchorElForToken)}
                  onMouseOver={(e: any) => handleClick(e, setAnchorElForToken)}
                >
                  <Typography className={classes.menuTitle}>
                    {PAGES_NAME.TOKEN}
                  </Typography>
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
                <Button
                  onClick={(e: any) => handleClick(e, setAnchorElForTokenomics)}
                  onMouseOver={(e: any) =>
                    handleClick(e, setAnchorElForTokenomics)
                  }
                >
                  <Typography className={classes.menuTitle}>
                    {PAGES_NAME.TOKENOMICS}
                  </Typography>
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
                <Button
                  onClick={(e: any) =>
                    handleClick(e, setAnchorElForMarketplace)
                  }
                  onMouseOver={(e: any) =>
                    handleClick(e, setAnchorElForMarketplace)
                  }
                >
                  <Typography className={classes.menuTitle}>
                    {PAGES_NAME.MARKETPLACE}
                  </Typography>
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
                <IconButton
                  onClick={(e: any) => handleClick(e, setAnchorElForProfile)}
                  onMouseOver={(e: any) =>
                    handleClick(e, setAnchorElForProfile)
                  }
                  sx={{ p: 0 }}
                >
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
                <Tooltip title="Copy Key">
                  <MenuItem
                    className={classes.menuItem}
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation();
                      navigator.clipboard.writeText(publicKey);
                    }}
                  >
                    <Typography>
                      {publicKey.slice(0, 10) + "..." + publicKey.slice(-6)}{" "}
                    </Typography>
                  </MenuItem>
                </Tooltip>
                <MenuItem onClick={logout} className={classes.menuItem}>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default TopBar;
