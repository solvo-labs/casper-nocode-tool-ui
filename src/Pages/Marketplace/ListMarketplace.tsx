import { CircularProgress, Divider, Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { MarketplaceCard } from "../../components/MarketplaceCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchMarketplaceNamedKeys } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Marketplace } from "../../utils/types";

const ListMarketplace = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      const data = await fetchMarketplaceNamedKeys(publicKey);
      const finalData: Marketplace[] = data.map((dt) => {
        return { contractHash: dt.key, contractName: dt.name.substring(26), listingCount: 0, feeWallet: "" };
      });

      setLoading(false);
      setMarketplaces(finalData);
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
        <h2>Active MarketPlace List</h2>
        <Divider sx={{ backgroundColor: "red", marginBottom: " 1rem !important" }}></Divider>

        {marketplaces.map((e: Marketplace) => (
          <MarketplaceCard hash={e.contractHash} name={e.contractName} onClick={() => navigate("/marketplace/" + e.contractHash)}></MarketplaceCard>
        ))}
      </Stack>
    </Grid>
  );
};

export default ListMarketplace;
