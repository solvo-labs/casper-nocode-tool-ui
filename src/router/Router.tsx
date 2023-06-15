import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Pages/Login";
import TokenMint from "../Pages/Token/TokenMint";
import Main from "../Pages/Main";
import Transfer from "../Pages/Token/Transfer";
import Approve from "../Pages/Token/Approve";
import MyTokens from "../Pages/Token/MyTokens";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename={import.meta.env.DEV ? "/" : "/casper-nocode-tool-ui"}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<Main />} />
            <Route path="/token" index element={<TokenMint />} />
            <Route path="/my-tokens" index element={<MyTokens />} />
            <Route path="/transfer" index element={<Transfer />} />
            <Route path="/approve" element={<Approve />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
