import React from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { APP_NAME, PAGES_NAME } from "../utils/enum";
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: "#0F1429 !important",
    padding: "2rem",
  },
  nested: {
    paddingLeft: theme.spacing(4),
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
  const handleClose = () => {
    navigate("/token");
    setAnchorEl(null);
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
              sx={{
                mr: 2,
                display: "flex",
                flexGrow: 1,
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              {APP_NAME.CASPER}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button onClick={() => {}} sx={{ my: 2, color: "white", display: "block" }}>
                {PAGES_NAME.STAKING}
              </Button>
              <Button onClick={() => {}} sx={{ my: 2, color: "white", display: "block" }}>
                {PAGES_NAME.DAO}
              </Button>
              <Button onClick={() => {}} sx={{ my: 2, color: "white", display: "block" }}>
                {PAGES_NAME.NFT}
              </Button>
              <Container>
                <Button onClick={handleClick} sx={{ my: 2, color: "white", display: "block" }}>
                  {PAGES_NAME.TOKEN}
                </Button>
                <Menu
                  id="demo-positioned-menu"
                  aria-labelledby="demo-positioned-button"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                >
                  <MenuItem onClick={handleClose}>{PAGES_NAME.TOKEN_MINT}</MenuItem>
                </Menu>
              </Container>
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
