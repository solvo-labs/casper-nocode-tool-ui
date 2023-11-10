import { CircularProgress, Divider, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { MarketplaceCard } from "../../components/ListerComponentCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchMarketplaceNamedKeys } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Marketplace } from "../../utils/types";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";

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

      setMarketplaces(finalData);
      setLoading(false);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
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
    <Grid marginBottom={"2rem"}>
      <Stack>
        {marketplaces.length <= 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <CreatorRouter explain={DONT_HAVE_ANYTHING.MARKETPLACE} handleOnClick={() => navigate("/create-marketplace")}></CreatorRouter>
          </div>
        )}
        {marketplaces.length > 0 && (
          <div>
            <Typography variant="h5">Active MarketPlace List</Typography>
            <Divider sx={{ backgroundColor: "red", marginBottom: " 1rem !important" }}></Divider>
            {marketplaces.map((e: Marketplace, index: number) => (
              <MarketplaceCard key={index} hash={e.contractHash} name={e.contractName} onClick={() => navigate("/marketplace/" + e.contractHash)}></MarketplaceCard>
            ))}
          </div>
        )}
      </Stack>
    </Grid>
  );
};

export default ListMarketplace;
