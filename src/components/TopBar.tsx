import React from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { APP_NAME, PAGES_NAME, TOKEN_PAGE } from "../utils/enum";
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@mui/material";

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [anchorElForProfile, setAnchorElForProfile] = React.useState<null | HTMLElement>(null);
  const openForProfile = Boolean(anchorElForProfile);

  const classes = useStyles();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickForProfile = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElForProfile(event.currentTarget);
  };

  const tokenMint = () => {
    navigate("/token");
    setAnchorEl(null);
  };

  const myTokens = () => {
    navigate("/my-tokens");
    setAnchorEl(null);
  };

  const transfer = () => {
    navigate("/transfer");
    setAnchorEl(null);
  };

  const approve = () => {
    navigate("/approve");
    setAnchorEl(null);
  };

  const mintAndBurn = () => {
    navigate("/mint-and-burn");
    setAnchorEl(null);
  };

  // const allowance = () => {
  //   navigate("/allowance");
  //   setAnchorEl(null);
  // };

  const increaseDecreaseAllowance = () => {
    navigate("/increase-decrease-allowance");
    setAnchorEl(null);
  };

  const transferFrom = () => {
    navigate("/transfer-from");
    setAnchorEl(null);
  };

  const logout = async () => {
    const CasperWalletProvider = window.CasperWalletProvider;
    const provider = CasperWalletProvider();

    const disconnectFromSite = await provider.disconnectFromSite();

    if (disconnectFromSite) {
      navigate("/login");
      setAnchorElForProfile(null);
    }
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
              <Button onClick={() => {}}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.STAKING}</Typography>
              </Button>
              <Button onClick={() => {}}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.DAO}</Typography>
              </Button>
              <Button onClick={() => {}}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.NFT}</Typography>
              </Button>
              <Button onClick={handleClick} onMouseOver={handleClick}>
                <Typography className={classes.menuTitle}>{PAGES_NAME.TOKEN}</Typography>
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  "& .MuiPaper-root": { background: "#0F1429", color: "#FFFFFF", border: "1px solid #FF0011" },
                }}
              >
                <MenuItem onClick={tokenMint} className={classes.menuItem}>
                  {TOKEN_PAGE.TOKEN_MINT}
                </MenuItem>
                <MenuItem onClick={myTokens} className={classes.menuItem}>
                  {TOKEN_PAGE.MY_TOKENS}
                </MenuItem>
                <MenuItem onClick={mintAndBurn} className={classes.menuItem}>
                  {TOKEN_PAGE.MINT_AND_BURN}
                </MenuItem>
                <MenuItem onClick={transfer} className={classes.menuItem}>
                  {TOKEN_PAGE.TRANSFER}
                </MenuItem>
                <MenuItem onClick={approve} className={classes.menuItem}>
                  {TOKEN_PAGE.APPROVE}
                </MenuItem>
                {/* <MenuItem onClick={allowance} className={classes.menuItem}>
                  {TOKEN_PAGE.ALLOWANCE}
                </MenuItem> */}
                <MenuItem onClick={increaseDecreaseAllowance} className={classes.menuItem}>
                  {TOKEN_PAGE.INCREASE_DECREASE_ALLOWANCE}
                </MenuItem>

                <MenuItem onClick={transferFrom} className={classes.menuItem}>
                  {TOKEN_PAGE.TRANSFER_FROM}
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile">
                <IconButton onClick={handleClickForProfile} onMouseOver={handleClickForProfile} sx={{ p: 0 }}>
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
                  "& .MuiPaper-root": { background: "#0F1429", color: "#FFFFFF", border: "1px solid #FF0011" },
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
                    <Typography>{publicKey.slice(0, 10) + "..." + publicKey.slice(-6)} </Typography>
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
