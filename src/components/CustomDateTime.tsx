import React from "react";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Stack } from "@mui/material";
import moment from "moment";

type Props = {
  label?: string;
  dateLabel?: string;
  clockLabel?: string;
  value: any;
  theme: "Dark" | "Light";
  onChange: (e: any) => void;
};

export const CustomDateTime: React.FC<Props> = ({ label, dateLabel, clockLabel, value, theme, onChange }) => {
  const style = {
    "& .MuiInputBase-input": {
      color: theme == "Dark" ? "white !important" : "black !important",
    },
    "& .MuiIconButton-root": {
      color: theme == "Dark" ? "white !important" : "black !important",
    },
    "& .MuiPopper-root-MuiPickersPopper-root": {
      marginTop: "20px",
      "&-MuiPickersPopper-paper": {
        backgroundColor: "#ff8a92",
      },
    },
    "& .MuiInputLabel-root": {
      color: "red !important",
      "&.Mui-focused": { color: "red", fontWeight: "bold" },
    },
    "& .MuiOutlinedInput": {
      "&-notchedOutline": {
        borderRadius: "1rem",
        borderColor: "gray",
      },
    },
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": { borderColor: "#ff8a92" },
      "&.Mui-focused fieldset": {
        borderColor: "red",
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Stack direction={"row"} spacing={2}>
        <DatePicker sx={style} defaultValue={moment()} value={moment.unix(value)} label={label || dateLabel} onChange={onChange} />
        <TimePicker ampm={false} sx={style} defaultValue={moment()} value={moment.unix(value)} label={label || clockLabel} onChange={onChange} />
      </Stack>
    </LocalizationProvider>
  );
};
