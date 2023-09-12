import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

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
  name: string;
  description: string;
  imageURL: string;
  index: number;
  onClick?: () => void;
};

export const NftCard: React.FC<Props> = ({ name, description, imageURL, index, onClick }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card className={classes.card} onClick={onClick}>
        <CardMedia component="img" height="250" image={imageURL} alt={name} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Name : {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description : {description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Index : {index}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
