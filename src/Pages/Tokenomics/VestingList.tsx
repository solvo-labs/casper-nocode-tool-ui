//@ts-ignore
import { CLPublicKey } from "casper-js-sdk";
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
import { useState } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { UnlockSchedule, UnlockScheduleType } from "../../lib/models/Vesting";

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
      backgroundColor: "whitesmoke",
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  },
  paginatonContainer: {
    display: "flex !important",
    justifyContent: "end",
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
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

  // const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [vestingList, setVestingList] = useState<[string, "Stream"][]>([]);
  const [outgoingvestingList, setOutgoingVestingList] = useState<[string, "Stream"][]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

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

  const tableHeaders = ["Name", "Status", "Start", "End", "Last Withdrawn At", "Mint", "Period", "Withdrawn Amount", "Deposited Amount", "Cliff", "Cliff Amount", "Claim"];

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

  const listVesting = (list: any, isOutgoing = false) => {
    return list?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((e: any, index: number) => (
      <TableRow className={classes.tableRow} key={index}>
        <TableCell>{e[1].name}</TableCell>
        <TableCell align="center">{getStatusIcon(e[1].start, e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].start)}</TableCell>
        <TableCell>{timestampToDate(e[1].end)}</TableCell>
        <TableCell>{timestampToDate(e[1].lastWithdrawnAt)}</TableCell>
        <TableCell>{e.metadata.name}</TableCell>
        <TableCell align="center">{Object.keys(UnlockSchedule).find((key) => UnlockSchedule[key as keyof UnlockScheduleType] === e[1].period)}</TableCell>
        <TableCell align="center">{e[1].withdrawnAmount.toNumber() / Math.pow(10, e.decimal)}</TableCell>
        <TableCell align="center">{e[1].depositedAmount.toNumber() / Math.pow(10, e.decimal)}</TableCell>
        <TableCell>{timestampToDate(e[1].cliff)}</TableCell>
        <TableCell align="center">{e[1].cliffAmount.toNumber() / Math.pow(10, e[1].cliffAmount.length)}</TableCell>
        {!isOutgoing && (
          <TableCell align="center">
            {e[1].withdrawnAmount.toNumber() !== e[1].depositedAmount.toNumber() && getTimestamp() >= e[1].start && getTimestamp() <= e[1].end && (
              <CustomButton onClick={() => {}} label={"Claim"} disabled={false} />
            )}
          </TableCell>
        )}
      </TableRow>
    ));
  };

  if (loading) {
    return (
      <div
        style={{
          height: "4rem",
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
            <Tab sx={{ color: "white" }} label="My Incoming Vesting's" value="1" />
            <Tab sx={{ color: "white" }} label="My outgoing Vesting's" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          {vestingList && (
            <Grid container direction={"row"} className={classes.container} sx={{ minWidth: "900px" }}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">My Incoming Vesting's</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer style={{ maxWidth: "100%" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map((header, index) => (
                          <TableCell key={index} className={classes.tableTitle}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>{listVesting(vestingList)}</TableBody>
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
        <TabPanel value="2">
          {outgoingvestingList && (
            <Grid container direction={"row"} className={classes.container} sx={{ minWidth: "900px" }}>
              <Grid item className={classes.titleContainer}>
                <Typography variant="h5">My Outgoing Vesting's</Typography>
                <Divider sx={{ marginTop: "1rem", background: "white" }} />
              </Grid>
              <Grid container marginTop={"2rem"}>
                <TableContainer style={{ maxWidth: "100%" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {tableHeaders.slice(0, -1).map((header, index) => (
                          <TableCell key={index} className={classes.tableTitle}>
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>{listVesting(outgoingvestingList, true)}</TableBody>
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
      </TabContext>
    </>
  );
};
