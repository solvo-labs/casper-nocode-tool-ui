import { Grid, MenuItem, SelectChangeEvent } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomSelect } from "./CustomSelect";
import { StakeForm } from "../utils/types";
import { PERIOD } from "../utils/enum";

type Props = {
  stakeForm: StakeForm;
  handleState: (stakeForm: StakeForm) => void;
};

const CustomStakeDateSelect: React.FC<Props> = ({ stakeForm, handleState }) => {
  const array = Array.from({ length: 30 }, (_, index) => index);
  const [durationList, setDurationList] = useState<string[]>([]);

  useEffect(() => {
    const durationArray: string[] = Object.keys(PERIOD).filter((key) => isNaN(Number(key)));
    setDurationList(durationArray);
  }, []);

  return (
    <Grid container display={"flex"} direction={"row"}>
      <Grid item width={"30%"} paddingRight={1}>
        <CustomSelect
          value={stakeForm.lockPeriod.unit ? stakeForm.lockPeriod.unit : "default"}
          label="Stake Unit"
          onChange={(event: SelectChangeEvent) => {
            handleState({
              ...stakeForm,
              lockPeriod: {
                ...stakeForm.lockPeriod,
                unit: Number(event.target.value),
              },
            });
          }}
          id={"custom-select"}
        >
          <MenuItem value="default">
            <em>Select Stake Unit</em>
          </MenuItem>
          {array.map((a) => (
            <MenuItem key={a + 1} value={a + 1}>
              <em>{a + 1}</em>
            </MenuItem>
          ))}
        </CustomSelect>
      </Grid>
      <Grid item width={"70%"} paddingLeft={1}>
        <CustomSelect
          value={stakeForm.lockPeriod.period ? PERIOD[stakeForm.lockPeriod.period] : "default"}
          label="Stake Lock Period"
          onChange={(event: SelectChangeEvent<{ value: unknown }>) => {
            const selectedValue = event.target.value as keyof typeof PERIOD;
            handleState({
              ...stakeForm,
              lockPeriod: {
                ...stakeForm.lockPeriod,
                period: PERIOD[selectedValue],
              },
            });
          }}
          id={"custom-select"}
        >
          <MenuItem value="default">
            <em>Select Stake Period</em>
          </MenuItem>
          {durationList.map((dur: string) => {
            return (
              <MenuItem key={dur} value={dur}>
                {dur}
              </MenuItem>
            );
          })}
        </CustomSelect>
      </Grid>
    </Grid>
  );
};

export default CustomStakeDateSelect;
