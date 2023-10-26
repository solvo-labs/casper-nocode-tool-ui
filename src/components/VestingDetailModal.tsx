import { Modal, Box, Typography, Stack, CircularProgress, Avatar } from "@mui/material";
import { VestingRecipient } from "../utils/types";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 960,
  height: 600,
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
  vesting: any;
  open: boolean;
  loading: boolean;
  recipients: VestingRecipient[];
  handleClose: () => void;
};

const VestingDetailModal: React.FC<Props> = ({ vesting, open, loading, recipients, handleClose }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h4">{vesting.contract_name}</Typography>
        {loading && (
          <div style={{ display: "flex", height: "90%", width: "100%", justifyContent: "center", alignItems: "center" }}>
            <CircularProgress></CircularProgress>
          </div>
        )}
        {!loading && (
          <div>
            <Typography variant="h6" marginTop={"0.5rem"}>
              Partipiciant count: {vesting.recipient_count}
            </Typography>
            <Stack marginTop={"2rem"} spacing={2} sx={{ overflowY: "scroll", height: "480px" }}>
              {recipients.map((rcpt: VestingRecipient, index: number) => (
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  sx={{ marginRight: "16px !important", border: "1px solid red", borderRadius: "12px", minHeight: "80px", ":hover": { bgcolor: "gray" } }}
                >
                  <Stack direction={"row"} spacing={2} alignItems={"center"}>
                    <Avatar></Avatar>
                    <Typography>hash-{rcpt.recipient}</Typography>
                    <Typography fontWeight={"bold"} variant="h6">
                      {rcpt.allocation / Math.pow(10, Number(parseInt(vesting.decimals.hex))) + " (" + vesting.token_symbol.toUpperCase() + ")"}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </div>
        )}
      </Box>
    </Modal>
  );
};

export default VestingDetailModal;
