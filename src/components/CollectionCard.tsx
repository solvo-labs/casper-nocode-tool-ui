import React from "react";
import { makeStyles } from "@mui/styles";
import {
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
    maxHeight: "400px",
    height: "360px",
    [theme.breakpoints.down("xl")]: {
      // fontSize: "1rem",
    },
  },
}));

type Props = {
  title: string;
  symbol: string;
  contractHash: string;
  onClick: () => void;
};

export const CollectionCard: React.FC<Props> = ({
  title,
  symbol,
  contractHash,
  onClick,
}) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card className={classes.card} onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image="https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="h6">{symbol}</Typography>
          <Typography variant="body2" color="text.secondary">
            {contractHash.slice(0, 20)}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default CollectionCard;
