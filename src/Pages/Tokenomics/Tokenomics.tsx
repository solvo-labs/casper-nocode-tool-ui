//@ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { Token, initTokens } from "../../utils/api";
import { Section } from "../../utils/types";
import { useNavigate, useOutletContext } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CardContent, CircularProgress, Divider, Grid, IconButton, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useMemo, useState } from "react";
import TokenSelector from "../../components/TokenSelector";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: "1rem",
    minWidth: "80vw",
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw",
      marginTop: "3rem",
    },
  },
  selectorContainer: {
    minWidth: "30vw !important",
    maxWidth: "30vw !important",
    textAlign: "center",
    [theme.breakpoints.down("lg")]: {
      minWidth: "40vw !important",
    },
    [theme.breakpoints.down("md")]: {
      minWidth: "60vw !important",
    },
  },
  titleContainer: {},
  input: {
    width: "100%",
  },
  itemContainer: {
    marginTop: "2rem !important",
  },
  cardContainer: {
    justifyContent: "center",
    minWidth: "60vw !important",
    maxWidth: "60vw !important",
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw !important",
    },
  },
  cardContent: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: "16px !important",
  },
}));

export const Tokenomics = () => {
  const classes = useStyles();

  const [publicKey] = useOutletContext<[publickey: string]>();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [loading, setLoading] = useState<boolean>(true);
  const [sections, setSections] = useState<Section[]>([
    {
      name: "",
      amount: 0,
      percent: 0,
      isOldSection: false,
    },
  ]);

  const navigate = useNavigate();

  const addInput = () => {
    setSections([...sections, { name: "", amount: 0, percent: 0, isOldSection: false }]);
  };

  const removeInput = (index: number) => {
    const list = [...sections];
    list.splice(index, 1);
    setSections(list);
  };

  const limits = useMemo(() => {
    if (selectedToken) {
      // const totalBalance = selectedToken.amount / Math.pow(10, selectedToken.decimal);

      const availableBalance = selectedToken.balance! - sections.reduce((acc, cur) => acc + cur.amount, 0);

      const availablePercent = (availableBalance / Number(selectedToken.balance)) * 100;

      return { availableBalance, availablePercent };
    }
  }, [sections, selectedToken]);

  const sectionSetter = (e: React.ChangeEvent<HTMLInputElement>, index: number, key: keyof Section) => {
    const newSection = [...sections];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if (selectedToken) {
      let targetValue: any;
      const supply = selectedToken.balance || 0;

      switch (key) {
        case "amount":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newPercent: number = +((targetValue / supply) * 100).toFixed(2);
          newSection[index] = {
            ...newSection[index],
            [key]: targetValue,
            percent: newPercent,
          };
          break;
        case "percent":
          targetValue = +e.target.value;

          // eslint-disable-next-line no-case-declarations
          const newAmount: number = (supply / 100) * targetValue;
          newSection[index] = {
            ...newSection[index],
            amount: newAmount,
            [key]: targetValue,
          };
          break;
        case "name":
          targetValue = e.target.value;
          newSection[index] = { ...newSection[index], [key]: targetValue };
          break;
        default:
          break;
      }
    }

    setSections(newSection);
  };

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const accountHash = ownerPublicKey.toAccountHashStr();
      const { finalData } = await initTokens(accountHash);

      console.log("finalData", finalData);

      const filteredFinalData = finalData.filter((fd) => fd.balance > 0);

      setTokens(filteredFinalData);
      setLoading(false);
    };

    init();
  }, []);

  console.log("tokens", tokens);

  const disable = useMemo(() => {
    const lenghtControl = sections.every((e: any) => e.name.length > 0);
    const disable = !(selectedToken != undefined && lenghtControl);
    return disable;
  }, [sections, selectedToken]);

  if (loading) {
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
    <Stack spacing={4} display={"flex"} alignItems={"center"} width={"100%"}>
      <Grid container className={classes.container}>
        <Grid item>
          <Stack spacing={4}>
            <Grid item className={classes.selectorContainer}>
              <Typography variant="h5">Tokenomics</Typography>
              <Divider sx={{ marginTop: "1rem", background: "white" }}></Divider>
            </Grid>
            <Grid item>
              <TokenSelector selectedToken={selectedToken} setSelectedToken={(data) => setSelectedToken(data)} tokens={tokens}></TokenSelector>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      <Grid container className={classes.cardContainer}>
        <Grid item>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Stack direction={"row"} justifyContent={"center"} spacing={4}>
              {selectedToken && (
                <>
                  <Typography> Selected: {selectedToken?.name} </Typography>
                  <Divider orientation="vertical" sx={{ marginTop: "1rem", background: "white" }} />
                  {limits?.availableBalance ? (
                    <Typography>
                      Available balance: {limits.availableBalance} (%
                      {limits.availablePercent.toFixed(2)})
                    </Typography>
                  ) : (
                    <Typography>Available balance: {limits?.availableBalance} </Typography>
                  )}
                  <Divider orientation="vertical" sx={{ marginTop: "1rem", background: "white" }} />
                  <Typography>
                    Total Balance:
                    {selectedToken?.balance}
                  </Typography>
                </>
              )}
            </Stack>
          </CardContent>
          {selectedToken && (
            <Stack direction={"column"} justifyContent={"space-around"} spacing={2}>
              {sections.map((section: Section, index: number) => (
                <Stack display={"flex"} justifyContent={"center"} alignItems={"center"} direction={"row"} spacing={2} key={index}>
                  <Grid item display={"flex"} alignContent={"center"}>
                    {index > sections.length - 2 ? (
                      <IconButton onClick={addInput} disabled={disable}>
                        <AddIcon sx={{ color: "white" }}></AddIcon>
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => removeInput(index)} disabled={section.isOldSection}>
                        <RemoveIcon sx={{ color: "red" }} />
                      </IconButton>
                    )}
                  </Grid>
                  <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} marginBottom={"10px !important"}>
                    <CustomInput
                      id="Name"
                      label="Section Name"
                      name="sectionName"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "name")}
                      placeholder="Section Name"
                      type="text"
                      disable={section.isOldSection}
                      value={section.name}
                    ></CustomInput>
                    <CustomInput
                      id="Percent"
                      label="%"
                      name="percent"
                      value={section.percent}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "percent")}
                      disable={section.isOldSection}
                      type="text"
                      placeholder={"percent"}
                    ></CustomInput>
                    <CustomInput
                      id="Amount"
                      label="Amount"
                      placeholder="Amount"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => sectionSetter(e, index, "amount")}
                      disable={section.isOldSection}
                      type="text"
                      value={section.amount}
                      name={"amount"}
                    />
                  </Grid>
                  <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"}>
                    <CustomButton
                      label="Vesting"
                      disabled={section.isOldSection || section.name === "" || limits!.availableBalance < 0}
                      onClick={() => {
                        navigate("/create-vesting/" + selectedToken.contractHash + "/" + section.name + "/" + section.amount);
                      }}
                    />
                  </Grid>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};
