import { CustomButton } from "../../components/CustomButton";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DoneIcon from "@mui/icons-material/Done";
import PendingIcon from "@mui/icons-material/Pending";
import { useEffect, useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { UnlockSchedule, UnlockScheduleType } from "../../lib/models/Vesting";
import { SERVER_API, contractHashToContractPackageHash, fetchVestingNamedKeys, getVestingDetails, getVestingList, setVestingRecipients } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import axios from "axios";
import { CasperHelpers, uint32ArrayToHex } from "../../utils";
import toastr from "toastr";
import VestingDetailModal from "../../components/VestingDetailModal";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    minWidth: 1200,
    maxWidth: 1200,
    justifyContent: "center",
  },
  titleContainer: {
    minWidth: "30vw",
    textAlign: "center",
  },
  tableTitle: {
    backgroundColor: "#bf000c",
    color: "white !important",
  },
  tableRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: "white",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#dddddd",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
    "&:hover": {
      backgroundColor: "#F5F5F5",
      cursor: "pointer",
    },
  },
  paginatonContainer: {
    display: "flex !important",
    justifyContent: "end",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    backgroundColor: "#bf000c",
  },
  pagination: {
    color: "white !important",
    "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
      color: "white",
      marginRight: "-10px",
    },
    "& .css-1mf6u8l-MuiSvgIcon-root-MuiSelect-icon": {
      color: "white",
      marginRight: "-10px",
    },
    "& .css-zylse7-MuiButtonBase-root-MuiIconButton-root.Mui-disabled": {
      color: "#f5f5f566",
    },
    "& .makeStyles-pagination-18 .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {},
  },
}));

const timestampToDate = (timestamp: number) => {
  const dateFormat = new Date(timestamp * 1000);
  const dayFormat = dateFormat.getDate().toString();
  const monthFormat = (dateFormat.getMonth() + 1).toString();
  const hourFormat = dateFormat.getHours().toString();
  const minutesFormat = dateFormat.getMinutes().toString();

  const formatter = (value: string): string => {
    value.length < 2 ? (value = 0 + "" + value) : value;
    return value;
  };
  const date = formatter(dayFormat) + "/" + formatter(monthFormat) + "/" + dateFormat.getFullYear() + " " + formatter(hourFormat) + ":" + formatter(minutesFormat);
  return timestamp == 0 ? "-" : date;
};

export const VestingList = () => {
  const classes = useStyles();
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [vestingList, setVestingList] = useState<any>([]);
  const [outgoingvestingList, setOutgoingvestingList] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [vestingOpen, setVestingOpen] = useState(false);
  const handleOpen = (setState: any) => setState(true);
  const handleClose = (setState: any) => setState(false);

  const getTimestamp = () => {
    return Math.floor(Date.now() / 1000);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        let data = await fetchVestingNamedKeys(publicKey);

        const vestingDetailsPromises = data.map((dt) => getVestingDetails(dt.key));

        const vestingDetails = await Promise.all(vestingDetailsPromises);

        const finalData = data.map((dt: any, index: number) => {
          return { ...vestingDetails[index], key: dt.key };
        });

        const accountHash: string = ownerPublicKey.toAccountHashStr();
        const incomingVestingList = await getVestingList(accountHash.substring(13));

        setVestingList(incomingVestingList);
        setOutgoingvestingList(finalData);

        setLoading(false);
      } catch (error) {
        toastr.error("Something went wrong");
      }
    };

    init();
  }, []);

  const tableHeaders = ["Name", "Status", "Start", "End", "Period", "Cliff", "Token", "Vesting Amount", "Recipient Count", "Released", "Action"];
  const tableHeadersIncoming = [
    "Name",
    "Status",
    "Index",
    "Contract",
    "Release",
    "End",
    "Cliff",
    "Token",
    "Owner",
    "Vesting Amount",
    "Allocation",
    "Claimed",
    "Released",
    "Action",
  ];

  const getStatusIcon = (startDate: number, endDate: number) => {
    const timestamp = getTimestamp();

    if (endDate <= timestamp) {
      return (
        <Tooltip title="Process is completed">
          {
            <span>
              <DoneIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    } else if (timestamp >= startDate && timestamp <= endDate) {
      return (
        <Tooltip title="Vesting is processing">
          {
            <span>
              <AutorenewIcon color="success" sx={{ zIndex: "-10px" }} />
            </span>
          }
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Process is waiting">
        {
          <span>
            <PendingIcon color="warning" sx={{ zIndex: "-10px" }} />
          </span>
        }
      </Tooltip>
    );
  };

  const transferTokenForVesting = async (data: any) => {
    const contract = new Contracts.Contract();
    const tokenContract = uint32ArrayToHex(data.cep18_contract_hash);
    const contractPackageHash = await contractHashToContractPackageHash(data.key.slice(5));

    contract.setContractHash("hash-" + tokenContract);
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      recipient: CasperHelpers.stringToKey(contractPackageHash),
      amount: CLValueBuilder.u256(parseInt(data.vesting_amount.hex)),
    });

    const deploy = contract.callEntrypoint("transfer", args, ownerPublicKey, "casper-test", "1000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, { headers: { "Content-Type": "application/json" } });
      toastr.success(response.data, "ERC-20 Token transfered successfully.");

      // setActionLoader(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const releaseVesting = async (input: any) => {
    setLoading(true);
    await transferTokenForVesting(input);
    const contract = new Contracts.Contract();

    contract.setContractHash(input.key);
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({});

    const deploy = contract.callEntrypoint("release", args, ownerPublicKey, "casper-test", "1000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, { headers: { "Content-Type": "application/json" } });
      toastr.success(response.data, "Released successfully.");
      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

      await setVestingRecipients(input.key);

      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const claimVesting = async (input: any) => {
    setLoading(true);
    const contract = new Contracts.Contract();

    contract.setContractHash(input.v_contract);

    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      cep18_contract_hash: CasperHelpers.stringToKey(input.v_token),
      index: CLValueBuilder.i32(input.v_index),
    });

    const deploy = contract.callEntrypoint("claim", args, ownerPublicKey, "casper-test", "6000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, { headers: { "Content-Type": "application/json" } });
      toastr.success(response.data, "Claimed successfully.");
      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  // const tableHeaders = ["Name", "Status", "Start", "End", "Token", "Withdrawn Amount", "Deposited Amount", "Cliff", "Claim"];
  const listVesting = (list: any) => {
    return list?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any, index: number) => (
      <>
        <TableRow
          className={classes.tableRow}
          key={index}
          onClick={() => {
            console.log(e);
            handleOpen(setVestingOpen);
          }}
        >
          <TableCell align="center">{e.contract_name}</TableCell>
          <TableCell align="center">{getStatusIcon(e.release_date.hex / 1000, e.end_date.hex / 1000)}</TableCell>
          <TableCell align="center">{timestampToDate(e.start_date.hex / 1000)}</TableCell>
          <TableCell align="center">{timestampToDate(e.end_date.hex / 1000)}</TableCell>
          <TableCell align="center">{Object.keys(UnlockSchedule).find((key) => UnlockSchedule[key as keyof UnlockScheduleType] === e.period.hex / 1000)}</TableCell>
          <TableCell align="center">{parseInt(e.cliff_timestamp.hex) + " sec"}</TableCell>
          <Tooltip
            title={Object.values(e.cep18_contract_hash)
              .map((byte: any) => byte.toString(16).padStart(2, "0"))
              .join("")}
          >
            <TableCell align="center">
              {Object.values(e.cep18_contract_hash)
                .map((byte: any) => byte.toString(16).padStart(2, "0"))
                .join("")
                .slice(0, 5) +
                "..." +
                Object.values(e.cep18_contract_hash)
                  .map((byte: any) => byte.toString(16).padStart(2, "0"))
                  .join("")
                  .slice(-3)}
            </TableCell>
          </Tooltip>
          <TableCell align="center">{parseInt(e.vesting_amount.hex)}</TableCell>
          <TableCell align="center">{e.recipient_count}</TableCell>
          <TableCell align="center">{e.released ? "TRUE" : "FALSE"}</TableCell>

          <TableCell align="center">
            <CustomButton
              onClick={() => {
                releaseVesting(e);
              }}
              label={"Release"}
              disabled={e.released}
            />
          </TableCell>
        </TableRow>
        <VestingDetailModal handleClose={() => handleClose(setVestingOpen)} open={vestingOpen} vesting={e}></VestingDetailModal>
      </>
    ));
  };

  //  const tableHeadersIncoming = ["Name", "Status", "Release", "End", "Cliff", "Token", "Vesting Amount", "Recipient Count", "Released", "Action"];
  const listIncomingVesting = (list: any) => {
    return list?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any, index: number) => (
      <TableRow className={classes.tableRow} key={index}>
        <TableCell>{e.contract_name}</TableCell>
        <TableCell align="center">{getStatusIcon(e.release_date.hex / 1000, e.end_date.hex / 1000)}</TableCell>
        <TableCell align="center">{e.v_index}</TableCell>
        <TableCell align="center">{e.v_contract}</TableCell>
        <TableCell align="center">{timestampToDate(e.release_date.hex / 1000)}</TableCell>
        <TableCell align="center">{timestampToDate(e.end_date.hex / 1000)}</TableCell>
        <TableCell align="center">{parseInt(e.cliff_timestamp.hex) + " sec"}</TableCell>
        <TableCell align="center">{e.v_token}</TableCell>
        <TableCell align="center">
          {Object.values(e.owner)
            .map((byte: any) => byte.toString(16).padStart(2, "0"))
            .join("")}
        </TableCell>

        <TableCell align="center">{parseInt(e.vesting_amount.hex)}</TableCell>
        <TableCell align="center">{parseInt(e.allocation)}</TableCell>
        <TableCell align="center">{parseInt(e.claimed_amount)}</TableCell>

        <TableCell>{"TRUE"}</TableCell>

        <TableCell align="center">
          <CustomButton
            onClick={() => {
              claimVesting(e);
            }}
            label={"Claim"}
            disabled={getTimestamp() < e.release_date.hex / 1000}
          />
        </TableCell>
      </TableRow>
    ));
  };

  if (loading) {
    return (
      <div
        style={{
          height: "60vh",
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

  return (
    <>
      <TabContext value={activeTab}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TabList
            onChange={(_event: React.SyntheticEvent, newValue: string) => {
              setActiveTab(newValue);
            }}
          >
            <Tab sx={{ color: "white" }} label="My Outgoing Vesting's" value="1" />
            <Tab sx={{ color: "white" }} label="My Incoming Vesting's" value="2" />
          </TabList>
        </Box>

        <TabPanel value="1">
          {outgoingvestingList && (
            <Grid container direction={"row"} className={classes.container} sx={{ minWidth: "900px" }}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">You'r creator for this vestings</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer style={{ maxWidth: "100%", borderRadius: "12px 12px 0px 0px" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map((header, index) => (
                          <TableCell key={index} className={classes.tableTitle} align="center">
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>{listVesting(outgoingvestingList)}</TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid container className={classes.paginatonContainer}>
                <TablePagination
                  className={classes.pagination}
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  colSpan={4}
                  count={outgoingvestingList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>
        <TabPanel value="2">
          {vestingList && (
            <Grid container direction={"row"} className={classes.container} sx={{ minWidth: "900px" }}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">My Incoming Vesting's</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer style={{ maxWidth: "100%", borderRadius: "12px 12px 0px 0px" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {tableHeadersIncoming.map((header, index) => (
                          <TableCell key={index} className={classes.tableTitle}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>{listIncomingVesting(vestingList)}</TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid container className={classes.paginatonContainer}>
                <TablePagination
                  className={classes.pagination}
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  colSpan={4}
                  count={vestingList.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </TabContext>
    </>
  );
};
