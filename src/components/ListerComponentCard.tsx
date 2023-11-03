import React, { MouseEvent } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, IconButton, Menu, MenuItem, Stack, Theme, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: "1rem",
    minWidth: "800px",
    maxWidth: "800px",
    maxHeight: "120px",
    // height: "300px",
    [theme.breakpoints.down("xl")]: {
      // fontSize: "1rem",
    },
  },
}));

type Props = {
  name: string;
  hash: string;
  asset?: string;
  menuOpen: boolean;
  anchorEl: null | HTMLElement;
  onClick?: () => void;
  handleOpenMenu: (e: MouseEvent<HTMLElement>) => void;
  handleCloseMenu: () => void;
  handleAddNFT: () => void;
};

export const MarketplaceCard: React.FC<Props> = ({ name, hash, asset, onClick }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card sx={{ display: "flex" }} className={classes.card} onClick={onClick}>
        <CardMedia component="img" sx={{ height: "auto", width: 200 }} image={asset ? asset : "/images/casper.png"} alt={name} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Typography component="div" variant="h5">
              {name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {hash}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </CardActionArea>
  );
};

export const LootboxCard: React.FC<Props> = ({ name, hash, asset, menuOpen, anchorEl, handleCloseMenu, handleOpenMenu, handleAddNFT }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card sx={{ display: "flex" }} className={classes.card}>
        <CardMedia component="img" sx={{ height: "auto", width: 200 }} image={asset ? asset : "/images/casper.png"} alt={name} />
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Typography component="div" variant="h5">
                {name}
              </Typography>
              <IconButton
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={handleOpenMenu}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {hash}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleCloseMenu}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <MenuItem onClick={handleAddNFT}>Add NFT</MenuItem>
              <MenuItem onClick={handleCloseMenu} disabled={true}>
                Buy
              </MenuItem>
            </Menu>
          </CardContent>
        </Box>
      </Card>
    </CardActionArea>
  );
};
