import React from "react";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Stack } from "@mui/material";
import moment from "moment";

type Props = {
  label?: string;
  firstLabel?: string;
  secondLabel?: string;
  value: any;
  onChange: (e: any) => void;
};

const style = {
  "& .MuiPopper-root-MuiPickersPopper-root": {
    marginTop: "20px",
    "&-MuiPickersPopper-paper": {
      backgroundColor: "#ff8a92",
    },
  },
  // "& .MuiInputLabel-root": { color: "black" },
  "& .MuiInputLabel-root.Mui-focused": { color: "black" },
  "& .MuiOutlinedInput": {
    "&-notchedOutline": {
      borderRadius: "1rem",
      borderColor: "black",
    },
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#ff8a92" },
    "&.Mui-focused fieldset": {
      borderColor: "red",
    },
  },
  "& .MuiPickersDay-root": {
    "&.Mui-selected": {
      backgroundColor: "#ff8a92 !important",
    },
  },
};

export const CustomDateTime: React.FC<Props> = ({ label, firstLabel, secondLabel, value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Stack direction={"row"} spacing={2}>
        <DatePicker sx={style} defaultValue={moment()} value={moment.unix(value)} label={label || firstLabel} onChange={onChange} />
        <TimePicker ampm={false} sx={style} defaultValue={moment()} value={moment.unix(value)} label={label || secondLabel} onChange={onChange} />
      </Stack>
    </LocalizationProvider>
  );
};
