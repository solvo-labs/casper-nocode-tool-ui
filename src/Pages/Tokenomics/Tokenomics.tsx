//@ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { Token, fetchErc20TokenDetails, fetchVestingNamedKeys, getVestingDetails, initTokens } from "../../utils/api";
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
import { uint32ArrayToHex } from "../../utils";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "80vw",
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw",
    },
    marginTop: "0",
    // marginBottom: "20rem !important",
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
  const [supply, setSupply] = useState<number>();

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

      const availableBalance = supply! / Math.pow(10, selectedToken.decimals) - sections.reduce((acc, cur) => acc + cur.amount, 0);

      const availablePercent = (availableBalance / Number(supply! / Math.pow(10, selectedToken.decimals))) * 100;

      return { availableBalance, availablePercent };
    }
  }, [sections, selectedToken, supply]);

  const sectionSetter = (e: React.ChangeEvent<HTMLInputElement>, index: number, key: keyof Section) => {
    const newSection = [...sections];

    if (selectedToken && supply) {
      let targetValue: any;

      const sectionHistory = sections.filter((_sc, ind) => ind !== index);

      const history = sectionHistory.reduce((acc, cur) => acc + cur.amount, 0);

      const availableBalance = supply - history * Math.pow(10, selectedToken.decimals);

      let supplyCalc = availableBalance / Math.pow(10, selectedToken.decimals);

      switch (key) {
        case "amount":
          targetValue = +e.target.value;

          const newPercent: number = +((targetValue / supplyCalc!) * 100).toFixed(2);
          newSection[index] = {
            ...newSection[index],
            [key]: targetValue,
            percent: newPercent,
          };
          break;
        case "percent":
          targetValue = +e.target.value;

          const newAmount: number = (supplyCalc! / 100) * targetValue;
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

  const fetchHistory = async (newToken: Token) => {
    try {
      setLoading(true);
      let data = await fetchVestingNamedKeys(publicKey);

      const vestingDetailsPromises = data.map((dt) => getVestingDetails(dt.key));

      const vestingDetails = await Promise.all(vestingDetailsPromises);

      const vestingHistory = vestingDetails.filter((vd) => uint32ArrayToHex(vd.cep18_contract_hash) === newToken.contractHash.substring(5));
      const tokenSupply = (await fetchErc20TokenDetails(newToken.contractHash || "")).total_supply;
      setSupply(parseInt(tokenSupply.hex));

      const oldSections: Section[] = vestingHistory.map((ol) => {
        return {
          name: ol.contract_name,
          amount: parseInt(ol.vesting_amount.hex) / Math.pow(10, newToken.decimals),
          percent: (parseInt(ol.vesting_amount.hex) / parseInt(tokenSupply.hex)) * 100,
          isOldSection: true,
        };
      });

      setSections([...sections, ...oldSections]);
      setLoading(false);
    } catch (error) {
      toastr.error("Something went wrong");
    }
  };

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const accountHash = ownerPublicKey.toAccountHashStr();

      const { finalData } = await initTokens(accountHash, publicKey);

      const filteredFinalData = finalData.filter((fd) => fd.balance > 0);

      setTokens(filteredFinalData);
      setLoading(false);
    };

    init();
  }, []);

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
              <Typography marginBottom={"1.2rem"}>Please select a token for vesting. We will fetch vesting history for current token.</Typography>
              <TokenSelector
                selectedToken={selectedToken}
                setSelectedToken={(data) => {
                  fetchHistory(data);
                  setSelectedToken(data);
                }}
                tokens={tokens}
              />
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
              {sections
                .sort((a, b) => (a.isOldSection === b.isOldSection ? 0 : a.isOldSection ? -1 : 1))
                .map((section: Section, index: number) => (
                  <Stack display={"flex"} justifyContent={"center"} alignItems={"center"} direction={"row"} spacing={2} key={index}>
                    <Grid item display={"flex"} alignContent={"center"}>
                      {index > sections.length - 2 ? (
                        <IconButton onClick={addInput} disabled={disable}>
                          <AddIcon sx={{ color: "white" }}></AddIcon>
                        </IconButton>
                      ) : (
                        !section.isOldSection && (
                          <IconButton onClick={() => removeInput(index)}>
                            <RemoveIcon sx={{ color: "red" }} />
                          </IconButton>
                        )
                      )}
                    </Grid>
                    <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} marginBottom={"10px !important"} gap={2}>
                      <CustomInput
                        id="Name"
                        label="Section Name"
                        name="sectionName"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => !section.isOldSection && sectionSetter(e, index, "name")}
                        placeholder="Section Name"
                        type="text"
                        value={section.name}
                      ></CustomInput>
                      <CustomInput
                        id="Percent"
                        label="%"
                        name="percent"
                        value={section.percent}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => !section.isOldSection && sectionSetter(e, index, "percent")}
                        type="text"
                        placeholder={"percent"}
                      ></CustomInput>
                      <CustomInput
                        id="Amount"
                        label="Amount"
                        placeholder="Amount"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => !section.isOldSection && sectionSetter(e, index, "amount")}
                        type="text"
                        value={section.amount}
                        name={"amount"}
                      />
                    </Grid>
                    {!section.isOldSection && (
                      <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"}>
                        <CustomButton
                          label="Vesting"
                          disabled={section.name === "" || limits!.availableBalance < 0}
                          onClick={() => {
                            navigate("/create-vesting/" + selectedToken.contractHash + "/" + section.name + "/" + section.amount);
                          }}
                        />
                      </Grid>
                    )}
                  </Stack>
                ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};
