import React, { useEffect, useState } from "react";
import { Card, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { ERC20Token } from "../../utils/types";
import { MY_ERC20TOKEN } from "../../utils/enum";
import { listofCreatorERC20Tokens } from "../../utils/api";

// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";

const useStyles = makeStyles(() => ({
  title: {
    fontWeight: 500,
    fontSize: "26px",
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
  tableContainer: {
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    minWidth: "50rem",
  },
  paper: {
    border: "1px solid #FF0011",
    padding: "1rem",
  },
}));

const MyTokens: React.FC = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = useState<ERC20Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const classes = useStyles();

  useEffect(() => {
    const init = async () => {
      const CasperWalletProvider = window.CasperWalletProvider;
      const provider = CasperWalletProvider();

      const publicKey = await provider.getActivePublicKey();

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      listofCreatorERC20Tokens(ownerPublicKey.toAccountHashStr().slice(13))
        .then((result) => {
          setData(result);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    init();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 8rem)",
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
    <div
      style={{
        height: "calc(100vh-5rem)",
        padding: "1rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h5 className={classes.title}>My Tokens</h5>

      {data.length !== 0 ? (
        <div>
          <Paper className={classes.paper}>
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
                    <TableCell key="decimal" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        {MY_ERC20TOKEN.DECIMAL}
                      </Typography>
                    </TableCell>
                    <TableCell key="total_supply" align="left">
                      <Typography fontWeight="bold" color="#0f1429">
                        {MY_ERC20TOKEN.TOTAL_SUPPLY}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell align="left">
                          <Typography color="#0f1429">{row.name}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{row.symbol}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{parseInt(row.decimals.hex, 16)}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{parseInt(row.total_supply.hex, 16)}</Typography>
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
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      ) : (
        <Grid
          item
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Card
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "5rem 2.5rem",
              margin: "2rem",
              boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              border: "1px solid #FF0011",
            }}
          >
            <Typography
              style={{
                color: "#0f1429",
                fontSize: "30px",
                fontWeight: "bold",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              You do not have any token.
            </Typography>
          </Card>
        </Grid>
      )}
    </div>
  );
};

export default MyTokens;
