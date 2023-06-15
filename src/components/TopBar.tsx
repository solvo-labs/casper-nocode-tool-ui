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

const TopBar: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const classes = useStyles();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
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
                <MenuItem onClick={transfer} className={classes.menuItem}>
                  {TOKEN_PAGE.TRANSFER}
                </MenuItem>
                <MenuItem onClick={approve} className={classes.menuItem}>
                  {TOKEN_PAGE.APPROVE}
                </MenuItem>
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile">
                <IconButton onClick={() => {}} sx={{ p: 0 }}>
                  <Avatar alt="alt" src="" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default TopBar;
