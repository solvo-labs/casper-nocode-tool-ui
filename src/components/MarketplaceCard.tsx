import React from "react";
import { makeStyles } from "@mui/styles";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Theme,
  Typography,
} from "@mui/material";

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
  // onClick: any;
  name: string;
  hash: string;
  imageURL?: string;
  onClick: () => void;
};

export const MarketplaceCard: React.FC<Props> = ({
  name,
  hash,
//   imageURL,
  onClick,
  
}) => {
  const classes = useStyles();

  return (
    <CardActionArea>
      <Card sx={{ display: "flex" }} className={classes.card} onClick={onClick}>
        <CardMedia
          component="img"
          sx={{ height: "auto", width: 200 }}
          image="https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg"
          alt={name}
        />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: "1 0 auto" }}>
            <Typography component="div" variant="h5">
              {name}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              component="div"
            >
              {hash}
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </CardActionArea>
  );
};
