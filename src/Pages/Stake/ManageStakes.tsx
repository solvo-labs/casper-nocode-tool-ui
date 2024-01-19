import { Grid } from "@mui/material";
import { useEffect } from "react";
import { fetchStakeKeys, getAllCep18StakePools, getStakes } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { STORE_CEP_18_STAKE_CONTRACT } from "../../utils";

const ManageStakes = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  useEffect(() => {
    const init = async () => {
      const data = await getAllCep18StakePools("hash-" + STORE_CEP_18_STAKE_CONTRACT);
      console.log(data);
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
