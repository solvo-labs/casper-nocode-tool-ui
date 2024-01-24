import { Box, Card, CardActions, CardContent, CircularProgress, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SERVER_API, contractHashToContractPackageHash, fetchErc20TokenDetails, getAllCep18StakePools } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { CasperHelpers, STORE_CEP_18_STAKE_CONTRACT } from "../../utils";
import { CustomButton } from "../../components/CustomButton";
import moment from "moment";
import { PERIOD } from "../../utils/enum";
import toastr from "toastr";
import { CustomInput } from "../../components/CustomInput";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import axios from "axios";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const ManageStakes = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [pools, setPools] = useState<any>([]);
  const [showStakeModal, setShowStakeModal] = useState<{ show: boolean; amount: number; action?: "stake" | "unstake"; selectedPool?: any }>({ show: false, amount: 0 });

  useEffect(() => {
    const init = async () => {
      const data = await getAllCep18StakePools("hash-" + STORE_CEP_18_STAKE_CONTRACT);

      if (data.length > 0) {
        const tokenDetailPromises = data.map((dt: any) => fetchErc20TokenDetails("hash-" + dt.token));
        const tokenDetails = await Promise.all(tokenDetailPromises);
        const finalData = data.map((dt: any, index: number) => {
          const currentToken = tokenDetails[index];
          const decimal = parseInt(currentToken.decimals.hex, 16);
          const maxApr = parseInt(dt.max_apr.hex, 16);
          const minApr = parseInt(dt.min_apr.hex, 16);
          const fixedApr = parseInt(dt.fixed_apr.hex, 16);
          const minStake = parseInt(dt.min_stake.hex, 16) / Math.pow(10, decimal);
          const maxStake = parseInt(dt.max_stake.hex, 16) / Math.pow(10, decimal);
          const maxCap = parseInt(dt.max_cap.hex, 16) / Math.pow(10, decimal);
          const totalSupply = parseInt(dt.total_supply.hex, 16) / Math.pow(10, decimal);
          const depositEndTime = moment(parseInt(dt.deposit_end_time.hex, 16));
          const depositStartTime = moment(parseInt(dt.deposit_start_time.hex, 16));
          const depositStartTimeFormatted = moment(parseInt(dt.deposit_start_time.hex, 16)).format("MMMM Do YYYY, HH:mm");
          const depositEndTimeFormatted = moment(parseInt(dt.deposit_end_time.hex, 16)).format("MMMM Do YYYY, HH:mm");
          const lockPeriod = moment(parseInt(dt.lock_period.hex, 16));

          return {
            key: dt.key,
            name: currentToken.name,
            symbol: currentToken.symbol,
            depositStartTime,
            depositEndTime,
            maxApr,
            minApr,
            fixedApr,
            minStake,
            maxStake,
            maxCap,
            totalSupply,
            lockPeriod,
            depositEndTimeFormatted,
            depositStartTimeFormatted,
            token: dt.token,
            decimal,
          };
        });
        setPools(finalData);
      }

      setLoading(false);
    };
    init();
  }, []);

  const increaseAllowance = async () => {
    console.log(showStakeModal.selectedPool);
    if (showStakeModal.selectedPool) {
      const contract = new Contracts.Contract();
      const selectedPool = showStakeModal.selectedPool;
      contract.setContractHash("hash-" + selectedPool.token);

      const contractPackageHash = await contractHashToContractPackageHash(selectedPool.key.slice(5));

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        spender: CasperHelpers.stringToKey(contractPackageHash),
        amount: CLValueBuilder.u256(showStakeModal.amount * Math.pow(10, selectedPool.decimal)),
      });

      const deploy = contract.callEntrypoint("increase_allowance", args, ownerPublicKey, "casper-test", "1000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Allowance created successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      toastr.error("Please Select a token for allowance");
    }
  };

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

  if (pools.length === 0) {
    return (
      <Typography style={{ borderBottom: "1px solid #FF0011 !important", marginBottom: "1rem", textAlign: "center" }} variant="h5">
        There are no stake pools
      </Typography>
    );
  }

  return (
    <>
      <Typography style={{ borderBottom: "1px solid #FF0011 !important", marginBottom: "1rem", textAlign: "center" }} variant="h5">
        STAKE CEP-18 TOKEN
      </Typography>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {pools.map((pl: any, index: number) => (
          <Card key={index} sx={{ minWidth: 500, flex: "1 0 30%", marginBottom: "16px" }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {pl.name}({pl.symbol}) Stake Pool
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Liquidity : {pl.totalSupply} ({pl.symbol})
              </Typography>

              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {pl.depositStartTimeFormatted} - {pl.depositEndTimeFormatted}
              </Typography>
              <Typography variant="body2">
                APR : {pl.fixedApr > 0 ? "Fixed APR : " + pl.fixedApr + "%" : "Min APR:" + pl.minApr + "%" + " - Max APR: " + pl.maxApr + "%"}
                <br />
                Cap : {pl.cap} ({pl.symbol}) , Min Stake : {pl.minStake} ({pl.symbol}) , Max Stake : {pl.maxStake} ({pl.symbol})
                <br />
                Lock Period : {PERIOD[pl.lockPeriod - pl.depositEndTime]}
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              {pl.depositEndTime > Date.now() ? (
                <>
                  <CustomButton
                    onClick={() => {
                      setShowStakeModal({ show: true, action: "stake", amount: 0, selectedPool: pl });
                      toastr.warning("Before staking, you need to provide an allowance.");
                    }}
                    label="Stake"
                    disabled={false}
                  />
                  <CustomButton
                    onClick={() => {
                      setShowStakeModal({ show: true, action: "unstake", amount: 0, selectedPool: pl });
                    }}
                    label="UnStake"
                    disabled={false}
                  />
                </>
              ) : (
                <CustomButton onClick={() => {}} label="Claim" disabled={false} />
              )}
            </CardActions>
          </Card>
        ))}
        {
          <Modal
            open={showStakeModal.show}
            onClose={() => {
              setShowStakeModal({ show: false, amount: 0 });
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" align="center" variant="h6" component="h2" style={{ color: "black" }}>
                {showStakeModal.action === "stake" ? "Stake CEP-18 Token" : "UnStake CEP-18 Token"}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }} style={{ color: "black" }}>
                <CustomInput
                  placeholder="Stake Amount"
                  label="Stake Amount"
                  id="amount"
                  name="amount"
                  type="text"
                  floor="light"
                  style={{ textColor: "pink" }}
                  onChange={(e: any) => {
                    setShowStakeModal({ ...showStakeModal, amount: Number(e.target.value) });
                  }}
                  value={showStakeModal.amount}
                />
              </Typography>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1rem" }}>
                <CustomButton
                  onClick={() => {
                    if (showStakeModal.action === "stake") increaseAllowance();
                  }}
                  label={showStakeModal.action || ""}
                  disabled={showStakeModal.amount <= 0}
                />
              </div>
            </Box>
          </Modal>
        }
      </div>
    </>
  );
};

export default ManageStakes;
