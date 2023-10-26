import { Modal, Box, Typography, Stack } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#0F1429",
  color: "white",
  border: "1px solid red",
  borderRadius: "12px",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

type Props = {
  vesting: any;
  open: boolean;
  handleClose: () => void;
};

const VestingDetailModal: React.FC<Props> = ({ vesting, open, handleClose }) => {
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <Typography variant="h4">{vesting.contract_name}</Typography>
        <Typography variant="h6" marginTop={"0.5rem"}>
          Partipiciant count: {vesting.recipient_count}
        </Typography>
        <Stack>
          <Typography>{Number(parseInt(vesting.vesting_amount.hex))}</Typography>
        </Stack>
      </Box>
    </Modal>
  );
};

export default VestingDetailModal;
