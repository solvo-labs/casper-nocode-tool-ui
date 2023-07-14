import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({}));

type Props = {
  onClick: any;
  title: string;
  description: string;
};

export const NftCard: React.FC = () => {
  const classes = useStyles();
  return (
    <Card sx={{ margin:"1rem" }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="200"
          image="https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg"
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Lizard
          </Typography>
          <Typography variant="body2" color="text.secondary">
          The Nissan GT-R (Japanese: GT-R, Nissan GT-R), is a sports car and grand tourer produced by Nissan, unveiled in 2007.
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
