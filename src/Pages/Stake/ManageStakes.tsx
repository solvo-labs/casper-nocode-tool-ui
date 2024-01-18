import { Grid } from "@mui/material";
import { useEffect } from "react";
import { fetchStakeKeys, getStakes } from "../../utils/api";
import { useOutletContext } from "react-router-dom";

const ManageStakes = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  useEffect(() => {
    const init = async () => {
      const la = await fetchStakeKeys(publicKey);
      const ka = await getStakes(la[0].key);
    };
    init();
  }, []);

  return (
    <Grid container>
      <p>asdasd</p>
    </Grid>
  );
};

export default ManageStakes;
