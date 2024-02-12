import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  alternateCard: {
    margin: "1rem",
    minHeight: "300px",
    [theme.breakpoints.down("md")]: {
      maxHeight: "240px",
    },
  },
}));

type Props = {
  title: string;
  symbol: string;
  image: string;
  contractHash: string;
  onClick: () => void;
  cardHeight?: string;
  cardWidth?: string;
  mediaHeight: string;
  cardContentPadding: string;
  cardContentTitle: string;
  cardContentContractHash: string;
  tokenCountText: string;
  amICreator?: boolean;
};

const CollectionCard: React.FC<Props> = ({
  title,
  symbol,
  contractHash,
  image,
  onClick,
  cardHeight,
  cardWidth,
  mediaHeight,
  cardContentPadding,
  cardContentTitle,
  cardContentContractHash,
  tokenCountText,
  amICreator = false,
}) => {
  return (
    <Card style={{ height: `${cardHeight}`, width: `${cardWidth}`, margin: "1rem" }} onClick={onClick}>
      <CardActionArea>
        <CardMedia component="img" height={mediaHeight} image={image} alt="collection-image" />
        <CardContent style={{ padding: `${cardContentPadding}` }}>
          <Stack direction={"row"} alignItems={"baseline"} spacing={1}>
            <Typography sx={{ fontSize: `${cardContentTitle}`, marginBottom: "5px" }} fontWeight={"bold"}>
              {title} ({symbol})
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: `${cardContentContractHash}`, marginBottom: "5px" }} fontWeight={"bold"}>
            ({tokenCountText})
          </Typography>
          <Typography sx={{ fontSize: `${cardContentContractHash}` }}>{contractHash.slice(0, 10) + "..." + contractHash.slice(-4)}</Typography>
          <Chip sx={{ marginTop: "0.5rem" }} label={amICreator ? "I'm owner" : "I'm a participant"} color={amICreator ? "success" : "warning"} size="small" />
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const CollectionCardAlternate: React.FC<Props> = ({ title, symbol, contractHash, image, tokenCountText, onClick }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card className={classes.alternateCard} onClick={onClick}>
        <CardMedia component="img" height="160" image={image} alt="collection-image" />
        <CardContent>
          <Typography variant="h5" fontWeight={"bold"}>
            {title}
          </Typography>
          <Typography variant="subtitle1">({symbol})</Typography>
          <Typography variant="subtitle1">{tokenCountText}</Typography>
          <Typography variant="body2" color="text.secondary">
            {contractHash.slice(0, 5)}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default CollectionCard;
