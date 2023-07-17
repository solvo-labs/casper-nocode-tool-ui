import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  title:{
    textAlign: "center",
    fontSize: "1.5rem",
    [theme.breakpoints.down("xl")]: {
      fontSize: "1rem",
      },
    [theme.breakpoints.down("sm")]: {
    fontSize: ".9rem",
    },
  }
}));

type Props = {
  onClick: any;
};

export const CreateCollectionCard: React.FC<Props> = ({onClick}) => {
  const classes = useStyles();
  return (
    <Card sx={{ margin:"1rem", minHeight:"320px", backgroundColor: "#161D3B", color:"white" }} onClick={onClick}>
      <CardActionArea sx={{padding: "1.2rem",}}>
        <CardMedia
          component="img"
          height="200"
          image="../../public/image/collection-image.jpg"
          alt="green iguana"
        />
        <CardContent>
          <p className={classes.title}>CREATE COLLECTION</p>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
