import React from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const connect = () => {
    const CasperWalletProvider = window.CasperWalletProvider;

    const provider = CasperWalletProvider();

    provider.requestConnection().then(() => {
      navigate("/");
    });
  };

  return (
    <>
      <Button variant="contained" onClick={connect}>
        Contained
      </Button>
    </>
  );
};

export default Login;
