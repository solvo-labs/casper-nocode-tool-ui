import { Stack, Typography, Grid } from "@mui/material";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { DONT_HAVE_ANYTHING } from "../utils/enum";

type Props = {
  explain: DONT_HAVE_ANYTHING;
  handleOnClick: () => void;
};

const CreatorRouter: React.FC<Props> = ({ explain, handleOnClick }) => {
  return (
    <Grid container display={"flex"} width={"100vw"} height={"60vh"} alignItems={"center"} justifyContent={"center"}>
      <Stack direction={"column"} spacing={4} display={"flex"}>
        <Typography variant="h4" sx={{ alignSelf: "center" }}>
          {explain}
        </Typography>
        <Stack direction={"row"} alignSelf={"flex-end"} alignItems={"center"} spacing={2}>
          <Typography variant="body1">Let's create one.</Typography>
          <div style={{ display: "flex", width: "72px", height: "72px" }}>
            <ArrowCircleRightIcon
              sx={{
                color: "red",
                width: "64px",
                height: "64px",
                transition: "0.1s ease-out",
                display: "block",
                margin: "auto",
                cursor: "pointer",
                ":hover": {
                  width: "72px",
                  height: "72px",
                },
              }}
              onClick={handleOnClick}
            ></ArrowCircleRightIcon>
          </div>
        </Stack>
      </Stack>
    </Grid>
  );
};

export default CreatorRouter;
