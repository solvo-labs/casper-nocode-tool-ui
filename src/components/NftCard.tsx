import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Chip, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: "1rem",
    maxHeight: "560px",
    minHeight: "240px",
    // height: "360px",
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
  price?: number;
  chipTitle?: string;
  status?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined;
  onClick?: () => void;
};

export const NftCard: React.FC<Props> = ({ name, description, imageURL, index, price, chipTitle, status, onClick }) => {
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
          {price && (
            <>
              <Typography variant="body1">Price : {price} CSPR</Typography>
            </>
          )}
          {!price && (
            <Typography variant="body2" color="text.secondary">
              Index : {index}
            </Typography>
          )}
          {chipTitle && <Chip sx={{ marginTop: "1rem" }} label={chipTitle} color={status} size="small"></Chip>}
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
