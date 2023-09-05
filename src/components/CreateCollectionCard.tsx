import React from "react";
import { makeStyles } from "@mui/styles";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Theme,
} from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: "1rem",
    maxHeight: "400px",
    height: "360px",
    backgroundColor: "#161D3B !important",
    color: "white !important",
  },
  title: {
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
    backgroundcolor: "primary",
    backgroundImage: `linear-gradient(45deg, #9F74FB, #8B5AF1)`,
    backgroundSize: "100%",
    backgroundRepeat: "repeat",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    [theme.breakpoints.down("xl")]: {
      fontSize: "1rem",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: ".9rem",
    },
  },
}));

type Props = {
  onClick: any;
};

export const CreateCollectionCard: React.FC<Props> = ({ onClick }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card className={classes.card} onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image="../../public/image/collection-image.jpg"
          alt="green iguana"
        />
        <CardContent sx={{ height: "fullWidth" }}>
          <p className={classes.title}>CREATE COLLECTION</p>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
