import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Tab,
  Theme,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { makeStyles } from "@mui/styles";
import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { RecipientModal } from "../../utils/types";
import { Durations, DurationsType, RecipientFormInput, UnlockSchedule, UnlockScheduleType, VestParamsData } from "../../lib/models/Vesting";
import dayjs from "dayjs";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import TabList from "@mui/lab/TabList";
import { CustomInput } from "../../components/CustomInput";
import DeleteIcon from "@mui/icons-material/Delete";
import { CustomButton } from "../../components/CustomButton";
import RecipientComponent from "../../components/RecipientComponent";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { CasperHelpers } from "../../utils";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  dateTimePicker: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
    color: "white !important",
    border: "1px solid #fff !important",
    "&:hover": {
      border: "1px solid #ff0011 !important",
    },
    borderRadius: "16px !important",
    "& .MuiIconButton-root": {
      color: "white", // Rengi beyaz yapar
    },
    "& .MuiTypography-root": {
      color: "white !important", // Tarih yazısının rengini beyaz yapar
    },
    "& .MuiInputLabel-root": {
      color: "white", // InputLabel yazı rengini beyaz yapar
    },
    "& input": {
      color: "white", // Input rengini beyaz yapar
    },
  },
  main: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "40px",
    paddingRight: "20px",
    paddingLeft: "20px",
    height: "600px",
    width: "600px",
    borderRadius: "5px",
  },
  container: {
    minWidth: "30vw",
    [theme.breakpoints.down("sm")]: {
      minWidth: "80vw",
    },
    paddingBottom: "2rem",
    color: "#fff !important",
  },
  divider: {
    marginTop: "1rem !important",
    background: "white !important",
  },
  title: {
    color: "black",
    textAlign: "center",
  },
  subTitle: {
    textAlign: "start",
  },
  input: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
  },
  select: {
    width: "100%",
    // maxHeight: "44px !important",
    [theme.breakpoints.up("sm")]: {
      // minWidth: "18rem !important",
    },
    [theme.breakpoints.down("sm")]: {
      // minWidth: "12rem !important",
    },
    color: "white !important",
    border: "1px solid #fff !important",
    "&:hover": {
      border: "1px solid #ff0011 !important",
    },
    borderRadius: "16px !important",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    // backgroundColor: theme.palette.background.paper,
    backgroundColor: "#0f1429",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    position: "relative", // Modal içeriği için göreceli konumlandırma
    minHeight: "25rem !important",
  },
  backButton: {
    top: theme.spacing(1),
    left: theme.spacing(1),
    color: "black",
    cursor: "pointer",
  },
}));

const recipientDefaultState = {
  name: "",
  amount: 0,
  cliffAmount: 0,
  recipientAddress: "",
};

export const Vesting = () => {
  const [vestParams, setVestParams] = useState<VestParamsData>({
    startDate: dayjs().add(1, "h"),
    duration: 1,
    selectedDuration: Durations.DAY,
    selectedUnlockSchedule: UnlockSchedule.HOURLY,
    cliffDuration: 1,
    selectedCliffDuration: Durations.DAY,
  });

  const [activateCliff, setActivateCliff] = useState<boolean>(false);
  const [recipientModal, setRecipientModal] = useState<RecipientModal>({
    show: false,
    activeTab: "1",
  });
  const [recipients, setRecipients] = useState<RecipientFormInput[]>([]);
  const [recipient, setRecipient] = useState<RecipientFormInput>(recipientDefaultState);
  const [loading, setLoading] = useState<boolean>(false);
  const [vestingLoading, setVestingLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const [publicKey, provider, , , , vestingWasm] = useOutletContext<[publicKey: string, provider: any, cep18Wasm: any, cep78Wasm: any, marketplaceWasm: any, vestingWasm: any]>();

  const classes = useStyles();

  const queryParams = useParams<{
    tokenid: string;
    name: string;
    amount: string;
  }>();

  const createVesting = async () => {
    setVestingLoading(true);
    try {
      setLoading(true);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const contract = new Contracts.Contract();

      const recipientList = recipients.map((rc) => CLValueBuilder.key(CLPublicKey.fromHex(rc.recipientAddress)));
      const allocation_list = recipients.map((rc) => CLValueBuilder.u256(rc.amount * Math.pow(10, 8)));

      const args = RuntimeArgs.fromMap({
        contract_name: CLValueBuilder.string(queryParams.name),
        vesting_amount: CLValueBuilder.u256(Number(queryParams.amount) * Math.pow(10, 8)),
        cep18_contract_hash: CasperHelpers.stringToKey(queryParams.tokenid || ""),
        start_date: CLValueBuilder.u64(vestParams.startDate.unix() * 1000),
        duration: CLValueBuilder.u64(vestParams.duration * vestParams.selectedDuration * 1000),
        period: CLValueBuilder.u64(vestParams.selectedUnlockSchedule * 1000),
        recipients: CLValueBuilder.list(recipientList),
        allocations: CLValueBuilder.list(allocation_list),
        cliff_timestamp: CLValueBuilder.u64(activateCliff ? vestParams.cliffDuration * vestParams.selectedCliffDuration * 1000 : 0),
      });

      const deploy = contract.install(new Uint8Array(vestingWasm!), args, "210000000000", ownerPublicKey, "casper-test");

      const deployJson = DeployUtil.deployToJson(deploy);

      // signer logic
      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        true;

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });

        setVestingLoading(false);
        navigate("/vesting-list");
        toastr.success(response.data, "Vesting deployed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/vesting-list");
        setLoading(false);
      } catch (error: any) {
        alert(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      toastr.error(err);
      setLoading(false);
    }
  };

  if (loading || vestingLoading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "50vw",
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
    <div className={classes.main}>
      <Grid container className={classes.container} direction={"column"}>
        <Grid item display={"flex"} justifyContent={"center"}>
          <Typography variant="h5" style={{ color: "white", borderBottom: "1px solid red" }}>
            Vesting
          </Typography>
        </Grid>
        <Grid item marginTop={"1.2rem"}>
          <Stack direction={"column"} width={"100%"} spacing={4}>
            <Typography>
              Token Total Balance : <b>{queryParams.amount}</b>
            </Typography>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {
                  <DateTimePicker
                    className={classes.dateTimePicker}
                    value={vestParams.startDate}
                    disablePast
                    label="Start Date"
                    onChange={(value: dayjs.Dayjs | null) => {
                      if (value) {
                        setVestParams({ ...vestParams, startDate: value });
                      }
                    }}
                  />
                }
              </LocalizationProvider>
            </FormControl>
            <Grid container>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <CustomInput
                    placeholder="Duration"
                    label="Duration"
                    id="name"
                    name="name"
                    type="text"
                    value={vestParams.duration}
                    onChange={(e: any) => {
                      setVestParams({ ...vestParams, duration: e.target.value });
                    }}
                    disable={false}
                  ></CustomInput>
                </FormControl>
              </Grid>
              <Grid item xs={1}></Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "white" }} id="selectLabel">
                    Durations
                  </InputLabel>
                  <Select
                    value={vestParams.selectedDuration.toString()}
                    label="Durations"
                    onChange={(e: SelectChangeEvent<string>) => {
                      setVestParams({
                        ...vestParams,
                        selectedDuration: Number(e.target.value),
                      });
                    }}
                    className={classes.select}
                    id={"durations"}
                  >
                    {Object.keys(Durations).map((tk) => {
                      return (
                        <MenuItem key={tk} value={Durations[tk as keyof DurationsType]}>
                          {tk}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel id="selectLabel" sx={{ color: "white" }}>
                Unlock Schedule
              </InputLabel>
              <Select
                value={vestParams.selectedUnlockSchedule.toString()}
                label="Unlock Schedule"
                onChange={(e: SelectChangeEvent<string>) => {
                  setVestParams({
                    ...vestParams,
                    selectedUnlockSchedule: Number(e.target.value),
                  });
                }}
                className={classes.select}
                id={"Unlock Schedule"}
              >
                {Object.keys(UnlockSchedule).map((tk) => {
                  return (
                    <MenuItem key={tk} value={UnlockSchedule[tk as keyof UnlockScheduleType]}>
                      {tk}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch color="error" value={activateCliff} onChange={() => setActivateCliff(!activateCliff)} />} label="Activate Cliff" />

            {activateCliff && (
              <>
                <FormControl fullWidth>
                  <Grid container>
                    <Grid item xs={3}>
                      <FormControl fullWidth>
                        <CustomInput
                          placeholder="Cliff Duration"
                          label="Cliff Duration"
                          id="cliffDuration"
                          name="cliffDuration"
                          type="text"
                          value={vestParams.cliffDuration}
                          onChange={(e: any) => {
                            setVestParams({ ...vestParams, cliffDuration: e.target.value });
                          }}
                          disable={false}
                        ></CustomInput>
                      </FormControl>
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={8}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: "white" }} id="selectLabel">
                          Durations
                        </InputLabel>
                        <Select
                          value={vestParams.selectedCliffDuration.toString()}
                          label="Durations"
                          onChange={(e: SelectChangeEvent<string>) => {
                            setVestParams({
                              ...vestParams,
                              selectedCliffDuration: Number(e.target.value),
                            });
                          }}
                          className={classes.select}
                          id={"durations"}
                        >
                          {Object.keys(Durations).map((tk) => {
                            return (
                              <MenuItem key={tk} value={Durations[tk as keyof DurationsType]}>
                                {tk}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </FormControl>
              </>
            )}
          </Stack>
        </Grid>
        <Stack direction={"row"} marginTop={"2rem"} display={"flex"} justifyContent={"space-between"}>
          <CustomButton label="Add Recipient" disabled={false} onClick={() => setRecipientModal({ ...recipientModal, show: true })} />
          <CustomButton label="Create Vesting Contract" disabled={vestParams.duration <= 0 || recipients.length <= 0} onClick={createVesting} />
        </Stack>
        <Modal
          className={classes.modal}
          open={recipientModal.show}
          onClose={() => {
            setRecipientModal({ ...recipientModal, show: false });
          }}
        >
          <Box
            sx={{
              borderRadius: "8px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 800,
              bgcolor: "#0f1429",
              border: "1px solid red",
              boxShadow: 24,
              p: 1,
            }}
          >
            <div className={classes.modalContent}>
              <Typography id="modal-modal-title" variant="h6" component="h2" color={"white"} align="center" marginBottom={"1rem"}>
                Manage The Recipient's
              </Typography>
              <Divider />
              <TabContext value={recipientModal?.activeTab || "1"}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={(_event: React.SyntheticEvent, newValue: string) => {
                      setRecipientModal({
                        ...recipientModal,
                        activeTab: newValue,
                      });
                    }}
                  >
                    <Tab sx={{ color: "white" }} label="Add New Recipient" value="1" />
                    <Tab sx={{ color: "white" }} label="Recipient List" value="2" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <RecipientComponent
                    inputs={recipient}
                    inputOnChange={(data) => {
                      setRecipient(data);
                    }}
                  />
                  <Grid item marginTop={2} display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"}>
                    <CustomButton
                      label="Save Recipient"
                      disabled={recipient.amount <= 0 || recipient.recipientAddress === ""}
                      onClick={() => {
                        const totalShare = recipients.reduce((acc, cur) => acc + Number(cur.amount), 0);

                        if (totalShare + Number(recipient.amount) > Number(queryParams.amount)) {
                          toastr.error("Please check your input because total balance is exceed");
                        } else {
                          const lastRecipients = [...recipients, recipient];

                          setRecipients(lastRecipients);
                          setRecipient(recipientDefaultState);
                          toastr.success("Recipient added succesfully.");
                        }
                      }}
                    />
                  </Grid>
                </TabPanel>
                <TabPanel value="2">
                  {recipients.length > 0 ? (
                    <List dense sx={{ width: "100%", maxWidth: 800 }}>
                      {recipients.map((value, index) => {
                        const labelId = `checkbox-list-secondary-label-${value}`;
                        return (
                          <div key={index}>
                            <ListItem
                              key={index}
                              style={{ background: "white" }}
                              secondaryAction={
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  size="small"
                                  onClick={() => {
                                    const clonedState = [...recipients];
                                    clonedState.splice(index, 1);

                                    setRecipients(clonedState);
                                  }}
                                >
                                  <DeleteIcon />
                                </Button>
                              }
                              disablePadding
                            >
                              <ListItemButton>
                                <ListItemText
                                  style={{ color: "black", fontWeight: "bold" }}
                                  id={labelId}
                                  primary={"Address: " + value.recipientAddress.slice(0, 10) + "..." + value.recipientAddress.slice(-10) + ", Amount: " + value.amount}
                                />
                              </ListItemButton>
                            </ListItem>
                            <Divider
                              sx={{
                                marginTop: "0.5rem",
                                marginBottom: "0.5rem",
                                background: "black",
                              }}
                            />
                          </div>
                        );
                      })}
                    </List>
                  ) : (
                    <span style={{ color: "white" }}>There are no recipients</span>
                  )}
                </TabPanel>
              </TabContext>
            </div>
          </Box>
        </Modal>
      </Grid>
    </div>
  );
};
