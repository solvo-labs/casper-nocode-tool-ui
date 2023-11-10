import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActionArea, CardContent, CardMedia, Chip, Theme, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Örnek bir ikon, gerekirse değiştirebilirsiniz
import { RarityLevel } from "../utils/enum";

const useStyles = makeStyles((_theme: Theme) => ({
  card: {
    margin: "1rem",
    maxHeight: "560px",
    minHeight: "240px",
  },

  selectedIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    color: "green",
  },
}));

type Props = {
  name: string;
  description: string;
  asset: string;
  index: number;
  owner?: string;
  amIOwner?: boolean;
  price?: number;
  chipTitle?: string;
  status?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined;
  isSelected?: boolean;
  rarity?: RarityLevel;
  onClick?: () => void;
};

export const NftCard: React.FC<Props> = ({ name, description, asset, index, owner, amIOwner = false, price, chipTitle, status, isSelected = false, rarity, onClick }) => {
  const classes = useStyles();

  const getRarityBadge = () => {
    let label = "";
    let color: any = "";

    if (rarity === 0) {
      label = "Common";
      color = "info";
    }

    if (rarity === 1) {
      label = "Rare";
      color = "warning";
    }

    if (rarity === 2) {
      label = "Legendary";
      color = "success";
    }

    return <Chip sx={{ marginTop: "0.5rem", fontSize: "1rem" }} label={label} color={color} />;
  };

  return (
    <CardActionArea
      sx={{
        "&:focus": {
          backgroundColor: "transparent !important",
          outline: "none !important",
        },
      }}
    >
      <Card className={classes.card} onClick={onClick}>
        {isSelected && <CheckCircleIcon className={classes.selectedIcon} fontSize="large" />}
        <CardMedia component="img" height="250" image={asset} alt={name} />
        <CardContent>
          <Typography fontWeight={"bold"} gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Description: {description}
          </Typography>
          {price && <Typography variant="body1">Price: {price} CSPR</Typography>}
          {!price && (
            <>
              <Typography variant="body2" color="text.secondary">
                Index: {index}
              </Typography>
              {owner && (
                <Typography variant="body2" color="text.secondary">
                  Owner : {owner}
                </Typography>
              )}
              {rarity !== undefined && getRarityBadge()}
              {rarity === undefined && (
                <Chip
                  sx={{ marginTop: "0.5rem", fontSize: "1rem" }}
                  label={amIOwner ? "My Nft" : "Rest of collection item"}
                  color={amIOwner ? "success" : "warning"}
                  size="small"
                />
              )}
            </>
          )}
          {chipTitle && <Chip sx={{ marginTop: "1rem" }} label={chipTitle} color={status} size="small"></Chip>}
        </CardContent>
      </Card>
    </CardActionArea>
  );
};
