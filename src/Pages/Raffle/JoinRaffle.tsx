import { Grid, Paper, Typography, TableContainer, Table, TableHead, TableCell, TableRow, TablePagination, TableBody, CircularProgress, Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { RaffleMetadata } from "../../utils/types";
//@ts-ignore
import { CLAccountHash, CLByteArray, CLKey, CLPublicKey, CLValueBuilder, Contracts, DeployUtil, RuntimeArgs } from "casper-js-sdk";
import { SERVER_API, getAllRafflesForJoin } from "../../utils/api";
import { STORE_RAFFLE_CONTRACT_HASH, uint32ArrayToHex } from "../../utils";
import { CustomButton } from "../../components/CustomButton";
import { makeStyles } from "@mui/styles";
import moment from "moment";
import axios from "axios";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "70vw",
    justifyContent: "center",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "80vw",
    },
  },
}));

const JoinRaffle = () => {
  const classes = useStyles();

  const [publicKey, provider, , , , , , , buyTicketWasm] =
    useOutletContext<
      [publicKey: string, provider: any, cep18Wasm: any, cep78Wasm: any, marketplaceWasm: any, vestingWasm: any, executeListingWasm: any, raffleWasm: any, buyTicketWasm: any]
    >();

  const [loading, setLoading] = useState<boolean>(true);
  const [joinableRaffle, setJoinableRaffle] = useState<RaffleMetadata[]>();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr().substring(13);

      const rafflesData = await getAllRafflesForJoin("hash-" + STORE_RAFFLE_CONTRACT_HASH);

      const finalJoinData: any[] = rafflesData.map((raffle: RaffleMetadata) => {
        return {
          key: raffle.key,
          collection: uint32ArrayToHex(raffle.collection),
          winner_account: raffle.winner_account,
          name: raffle.name,
          owner: uint32ArrayToHex(raffle.owner),
          nft_index: Number(raffle.nft_index.hex),
          start_date: Number(raffle.start_date.hex),
          end_date: Number(raffle.end_date.hex),
          price: Number(raffle.price.hex),
          claimed: raffle.claimed,
          status: raffle.status,
          partipiciant_count: Number(raffle.partipiciant_count?.hex || 0),
        };
      });

      const lastData = finalJoinData.filter((raffle: any) => {
        if (raffle.claimed) {
          return !raffle.claimed;
        }

        if (raffle.winner_account) {
          return raffle.winner_account === accountHash;
        }

        return raffle.owner != accountHash && moment.unix(raffle.end_date).unix() >= Date.now();
      });
      setJoinableRaffle(lastData);
      setLoading(false);
    };
    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const buy_ticket = async (raffle: any) => {
    setLoading(true);
    try {
      if (raffle) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        const args = RuntimeArgs.fromMap({
          raffle_contract_hash: new CLAccountHash(Buffer.from(raffle?.key.substring(5), "hex")),
          amount: CLValueBuilder.u512(raffle.price),
        });

        const deploy = contract.install(new Uint8Array(buyTicketWasm), args, "10000000000", ownerPublicKey, "casper-test");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Deposit successfully.");
          setLoading(false);
        } catch (error: any) {
          alert(error.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const claim = async (raffle: any) => {
    setLoading(true);
    try {
      const contract = new Contracts.Contract();
      contract.setContractHash(raffle.key);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({});

      const deploy = contract.callEntrypoint("claim", args, ownerPublicKey, "casper-test", "5000000000");
      console.log(deploy);

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });

        toastr.success(response.data, "Approve deployed successfully.");
        setLoading(false);
      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
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
    <Grid container direction={"column"} className={classes.container}>
      <Grid item display={"flex"}>
        <Typography variant="h4" sx={{ borderBottom: "1px solid red" }}>
          Join Raffle
        </Typography>
      </Grid>
      <Grid item sx={{ marginTop: "2rem" }}>
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell key="name" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell key="symbol" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      Start
                    </Typography>
                  </TableCell>
                  <TableCell key="decimal" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      End
                    </Typography>
                  </TableCell>
                  <TableCell key="collection" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      Collection
                    </Typography>
                  </TableCell>
                  <TableCell key="nft-id" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      NFT ID
                    </Typography>
                  </TableCell>
                  <TableCell key="ticket-count" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      Ticket Count
                    </Typography>
                  </TableCell>
                  <TableCell key="raffle-price" align="left">
                    <Typography fontWeight="bold" color="#0f1429">
                      Price
                    </Typography>
                  </TableCell>
                  <TableCell key="raffle-actions" align="center">
                    <Typography fontWeight="bold" color="#0f1429">
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {joinableRaffle &&
                  joinableRaffle.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((raffle: any, index: number) => {
                    return (
                      <TableRow style={{ cursor: "pointer" }} onClick={() => {}} hover role="checkbox" tabIndex={-1} key={index}>
                        <TableCell align="left">
                          <Typography color="#0f1429">{raffle.name}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{moment.unix(raffle.start_date / 1000).format("MM/DD/YYYY h:mm A")}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{moment.unix(raffle.end_date / 1000).format("MM/DD/YYYY h:mm A")}</Typography>
                        </TableCell>{" "}
                        <TableCell align="left">
                          <Typography color="#0f1429">{raffle.collection.substring(0, 10) + "..." + raffle.collection.substring(54)}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{raffle.nft_index}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{raffle.partipiciant_count}</Typography>
                        </TableCell>
                        <TableCell align="left">
                          <Typography color="#0f1429">{raffle.price / Math.pow(10, 9)}</Typography>
                        </TableCell>
                        {moment.unix(raffle.end_date).unix() < Date.now() ? (
                          <TableCell align="left">
                            <CustomButton disabled={false} label="Claim" onClick={() => claim(raffle)}></CustomButton>
                          </TableCell>
                        ) : (
                          <TableCell align="left">
                            <CustomButton disabled={false} label="buy ticket" onClick={() => buy_ticket(raffle)}></CustomButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[1, 5, 10]}
            component="div"
            count={joinableRaffle?.length || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default JoinRaffle;
