import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Pages/Login";
import TokenMint from "../Pages/Token/TokenMint";
import Main from "../Pages/Main";
import Transfer from "../Pages/Token/Transfer";
import Approve from "../Pages/Token/Approve";
import MyTokens from "../Pages/Token/MyTokens";
import MintAndBurn from "../Pages/Token/MintAndBurn";
import Allowance from "../Pages/Token/Allowance";
import IncreaseDecreaseAllowance from "../Pages/Token/IncreaseDecreaseAllowance";
import TransferFrom from "../Pages/Token/TransferFrom";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename={"/"}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<Main />} />
            <Route path="/token" index element={<TokenMint />} />
            <Route path="/my-tokens" index element={<MyTokens />} />
            <Route path="/transfer" index element={<Transfer />} />
            <Route path="/transfer-from" index element={<TransferFrom />} />
            <Route path="/approve" element={<Approve />} />
            <Route path="/mint-and-burn" element={<MintAndBurn />} />
            <Route path="/allowance" element={<Allowance />} />
            <Route path="/increase-decrease-allowance" element={<IncreaseDecreaseAllowance />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
