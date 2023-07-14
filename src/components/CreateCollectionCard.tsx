import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({}));

type Props = {
  onClick: any;
};

export const CreateCollectionCard: React.FC<Props> = ({onClick}) => {
  const classes = useStyles();
  return (
    <Card sx={{ margin:"1rem" }} onClick={onClick}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="200"
          image="https://icons-for-free.com/iconfiles/png/512/create+cross+new+plus+icon-1320168707626274697.png"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
          CREATE COLLECTION
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
