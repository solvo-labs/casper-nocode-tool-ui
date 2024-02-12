import { Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { MY_ERC20TOKEN } from "../utils/enum";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  title: {
    color: "white",
    fontWeight: "bold !important",
    fontSize: "1.5rem !important",
  },
  tableContainer: {
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
  },
  tableStr: {
    fontSize: "16px !important",
    fontWeight: "500 !important",
    color: "#fff !important",
  },
  tableInt: {
    fontSize: "16px !important",
    fontWeight: "500 !important",
    fontFamily: "monospace !important",
    color: "#fff !important",
  },
}));

type Props = {
  tokens: any;
  page: number;
  rowsPerPage: number;
  handleChangePage: () => void;
  handleChangeRowsPerPage: () => void;
};

const TokenListMainMenu: React.FC<Props> = ({ tokens, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container direction={"column"}>
          <Typography className={classes.title}>My Tokens</Typography>
          <Grid item marginTop={5}>
            {tokens.length > 0 && (
              <>
                <TableContainer className={classes.tableContainer}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell key="name" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.NAME}
                          </Typography>
                        </TableCell>
                        <TableCell key="symbol" align="left">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.SYMBOL}
                          </Typography>
                        </TableCell>
                        <TableCell key="decimal" align="center">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.DECIMAL}
                          </Typography>
                        </TableCell>
                        <TableCell key="balance" align="center">
                          <Typography fontWeight="bold" color="#0f1429">
                            {MY_ERC20TOKEN.BALANCE}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tokens.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, index: number) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            onClick={() => window.open("https://testnet.cspr.live/contract/" + row.contractHash, "_blank")}
                            tabIndex={-1}
                            key={index}
                            style={{ cursor: "pointer" }}
                          >
                            <TableCell align="left">
                              <Typography className={classes.tableStr}>{row.name}</Typography>
                            </TableCell>
                            <TableCell align="left">
                              <Typography className={classes.tableStr}>{row.symbol}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography className={classes.tableInt}>{row.decimals}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography className={classes.tableInt}>{row.balance}</Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[1, 5, 10]}
                  component="div"
                  count={tokens.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ color: "#fff !important", "& .MuiSvgIcon-root": { fill: "#fff !important" } }}
                />
              </>
            )}
            {tokens.length <= 0 && (
              <Grid container display={"flex"} alignContent={"center"} direction={"column"}>
                <Typography className={classes.title}>You have not an any Token</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TokenListMainMenu;
