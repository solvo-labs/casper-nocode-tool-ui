/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, useRef } from "react";
import { Avatar, Button, Grid, IconButton, LinearProgress, Stack, Theme, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "@mui/styles";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    borderColor: "white !important",
    color: "white !important",
    borderRadius: "16px",
    padding: "1rem",
    justifyContent: "space-between",
    borderStyle: "solid",
    borderWidth: "0.02rem",
    width: "100%",
  },
  input: {
    display: "none",
  },
  button: {
    padding: "10px",
    color: "#FFFFFF !important",
    borderRadius: "1rem",
    maxHeight: "24px",
    [theme.breakpoints.down("sm")]: {
      minWidth: "200px",
    },
    "&.Mui-disabled": {
      backgroundColor: "#FEBFC4 !important",
    },
    "&:not(.Mui-disabled)": {
      backgroundColor: "#FF0011",
      "&:hover": {
        backgroundColor: "#BF000C",
      },
    },
  },
  icon: {
    color: "#FF0011 !important",
  },
}));

type Props = {
  file: File | undefined;
  loading: boolean;
  setFile: (image: File | null) => void;
  handleClear: () => void;
};

const ImageUpload: React.FC<Props> = ({ file, loading, handleClear, setFile }) => {
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  // const handleClearButtonClick = () => {
  //   setFile(null);
  //   inputRef.current!.value = "";
  // };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    if (event.target.files) {
      const file = event.target.files[0];
      setFile(file);
    }
  };

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Stack spacing={1}>
          <Typography variant="body1">Upload your icon (optional)</Typography>
          <input className={classes.input} accept="image/*" multiple id="contained-button-file" type="file" onChange={handleFileInputChange} ref={inputRef}></input>
          <label htmlFor="contained-button-file">
            <Button className={classes.button} variant="contained" color="primary" component="span">
              Select Image
            </Button>
          </label>
        </Stack>
      </Grid>
      {file && (
        <Grid item display={"flex"} justifySelf={"flex-end"}>
          <Grid container display={"flex"} alignItems={"center"}>
            {!loading && (
              <Grid item>
                <Tooltip title="Clear image">
                  <IconButton onClick={handleClear} className={classes.icon}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Avatar alt="Image" src={URL.createObjectURL(file)} sx={{ width: 72, height: 72, border: "2px solid #FF0011" }}></Avatar>
          </Grid>
        </Grid>
      )}
      {loading && (
        <Grid sx={{ width: "100%", marginTop: "1rem" }}>
          <LinearProgress />
        </Grid>
      )}
    </Grid>
  );
};

export default ImageUpload;
