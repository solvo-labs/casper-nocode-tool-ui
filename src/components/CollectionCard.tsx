import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

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
}) => {
  return (
    <CardActionArea>
      <Card style={{ height: `${cardHeight}`, margin: "1rem" }} onClick={onClick}>
        <CardMedia component="img" height={mediaHeight} image={image} alt="collection-image" />
        <CardContent style={{ padding: `${cardContentPadding}` }}>
          <div style={{ fontSize: `${cardContentTitle}`, marginBottom: "5px", fontWeight: "700" }}>{title}</div>
          <div style={{ fontSize: `${cardContentSymbol}`, marginBottom: "5px" }}>{symbol}</div>
          <div style={{ fontSize: `${cardContentContractHash}` }}>{contractHash.slice(0, 20)}</div>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export const CollectionCardAlternate: React.FC<Props> = ({ title, symbol, contractHash, image, onClick }) => {
  const classes = useStyles();
  return (
    <>
      <CardActionArea>
        <Card className={classes.alternateCard} onClick={onClick}>
          <CardMedia component="img" height="160" image={image} alt="collection-image" />
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
    </>
  );
};

export default CollectionCard;
