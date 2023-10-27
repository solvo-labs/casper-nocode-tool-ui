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
  cardHeight: string;
  mediaHeight: string;
  cardContentPadding: string;
  cardContentTitle: string;
  cardContentSymbol: string;
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
  mediaHeight,
  cardContentPadding,
  cardContentTitle,
  cardContentSymbol,
  cardContentContractHash,
  tokenCountText,
  amICreator = false,
}) => {
  return (
    <CardActionArea>
      <Card style={{ height: `${cardHeight}`, margin: "1rem" }} onClick={onClick}>
        <CardMedia component="img" height={mediaHeight} image={image} alt="collection-image" />
        <CardContent style={{ padding: `${cardContentPadding}` }}>
          <Stack direction={"row"} alignItems={"baseline"} spacing={1}>
            <Typography sx={{ fontSize: `${cardContentTitle}`, marginBottom: "5px" }} fontWeight={"bold"}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: `${cardContentSymbol}`, marginBottom: "5px" }}>{symbol}</Typography>
          </Stack>
          <Typography sx={{ fontSize: `${cardContentContractHash}`, marginBottom: "5px" }} fontWeight={"bold"}>
            ({tokenCountText})
          </Typography>
          <Typography sx={{ fontSize: `${cardContentContractHash}` }}>{contractHash.slice(0, 40)}</Typography>
          <Chip sx={{ marginTop: "0.5rem" }} label={amICreator ? "I'm owner" : "I'm a participant"} color={amICreator ? "success" : "warning"} size="small" />
        </CardContent>
      </Card>
    </CardActionArea>
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
            {contractHash.slice(0, 20)}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default CollectionCard;
