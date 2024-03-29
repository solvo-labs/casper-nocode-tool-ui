import { Box, Modal, TextField, Typography } from "@mui/material";
import React from "react";
import { CustomButton } from "./CustomButton";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "#0F1429",
  color: "white",
  border: "1px solid red",
  borderRadius: "12px",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  "&:focus": {
    outline: "none",
  },
};

type Props = {
  showStakeModal: any;
  handleStakeModal: (stake: any) => void;
  stake: () => void;
  increaseAllowance: () => void;
  unStake: () => void;
  claim: () => void;
  notify?: () => void;
  refundReward?: () => void;
};

const StakeModal: React.FC<Props> = ({ showStakeModal, handleStakeModal, stake, increaseAllowance, unStake, claim, notify, refundReward }) => {
  return (
    <Modal
      open={showStakeModal.show}
      onClose={() => {
        handleStakeModal({ show: false, amount: 0 });
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography marginY={2} align="center" variant="h6" component="h2">
          {showStakeModal.action?.toUpperCase() + " CEP-18 Token"}
        </Typography>
        {showStakeModal.action === "notify" && (
          <Typography sx={{ mt: 2 }}>
            Before Increase{" "}
            <b>
              {showStakeModal.selectedPool.notifyAmount} {showStakeModal.selectedPool.symbol}
            </b>{" "}
            Token and notify for this pool.
          </Typography>
        )}
        {showStakeModal.action === "stake" && (
          <Typography sx={{ mt: 2 }}>
            <TextField
              label="Amount"
              name="stakeAmount"
              placeholder="Stake Amount"
              type="text"
              value={showStakeModal.amount}
              onChange={(e: any) => {
                handleStakeModal({ ...showStakeModal, amount: Number(e.target.value) });
              }}
              sx={{
                width: "100%",
                my: "1rem",
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderRadius: "1rem",
                    border: "1px solid #BFBFBF",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FF0011",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF0011",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF0011",
                },
              }}
            ></TextField>
          </Typography>
        )}
        {showStakeModal.action === "unstake" && (
          <Typography sx={{ mt: 2 }}>
            Unstake{" "}
            <b>
              {showStakeModal.selectedPool.my_balance} {showStakeModal.selectedPool.symbol}
            </b>{" "}
            Token.
          </Typography>
        )}
        {showStakeModal.action === "claim" && <Typography sx={{ mt: 2 }}>Claim your reward.</Typography>}
        {showStakeModal.action === "refund" && <Typography sx={{ mt: 2 }}>Get your reward refunded.</Typography>}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2rem", gap: "1rem" }}>
          {showStakeModal.action === "notify" && (
            <>
              <CustomButton
                onClick={() => {
                  if (notify) notify();
                }}
                label={showStakeModal.action + " Reward" || ""}
                disabled={showStakeModal.amount <= 0}
              />
              <CustomButton
                onClick={() => {
                  increaseAllowance();
                }}
                label={"Increase Allowance"}
                disabled={showStakeModal.amount <= 0}
              />
            </>
          )}
          {showStakeModal.action === "stake" && (
            <>
              <CustomButton
                onClick={() => {
                  stake();
                }}
                label={showStakeModal.action || ""}
                disabled={
                  showStakeModal.amount <= 0 || showStakeModal.amount > showStakeModal.selectedPool?.maxStake || showStakeModal.amount < showStakeModal.selectedPool?.minStake
                }
              />
              <CustomButton
                onClick={() => {
                  increaseAllowance();
                }}
                label={"Increase Allowance"}
                disabled={showStakeModal.amount <= 0}
              />
            </>
          )}

          {showStakeModal.action === "unstake" && (
            <>
              <CustomButton
                onClick={() => {
                  unStake();
                }}
                label={showStakeModal.action || ""}
                disabled={showStakeModal.amount <= 0}
              />
            </>
          )}
          {showStakeModal.action === "claim" && (
            <>
              <CustomButton
                onClick={() => {
                  claim();
                }}
                label={showStakeModal.action || ""}
                disabled={false}
              />
            </>
          )}
          {showStakeModal.action === "refund" && (
            <CustomButton
              onClick={() => {
                if (refundReward) refundReward();
              }}
              label={showStakeModal.action || ""}
              disabled={false}
            />
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default StakeModal;
