import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: "1rem",
    maxHeight: "400px",
    height: "300px",
    [theme.breakpoints.down("xl")]: {
      // fontSize: "1rem",
    },
  },
}));

type Props = {
  name: string;
  description: string;
  imageURL: string;
  onClick?: () => void;
};

export const NftCard: React.FC<Props> = ({ name, description, imageURL, onClick }) => {
  const classes = useStyles();
  return (
    <CardActionArea>
      <Card className={classes.card} onClick={onClick}>
        <CardMedia component="img" height="200" image={imageURL} alt={name} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
