import { CircularProgress, Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { MarketplaceCard } from "../../components/MarketplaceCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchMarketplaceNamedKeys } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Marketplace } from "../../utils/types";

const ListMarketplace = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [marketplace, setMarketplace] = useState<Marketplace[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const data = await fetchMarketplaceNamedKeys(publicKey);

      setLoading(false);
      setMarketplace(data);
      console.log(data);
    };

    init();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid>
      <Stack>
        {marketplace.map((e: any) => (
          <MarketplaceCard hash={e.key.slice(0, 20)} name={e.name} onClick={() => navigate("/marketplace/" + e.key)}></MarketplaceCard>
        ))}
      </Stack>
    </Grid>
  );
};

export default ListMarketplace;
