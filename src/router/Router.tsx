import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Pages/Login";
import TokenMint from "../Pages/TokenMint";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<TokenMint />} />
            <Route path="/token" index element={<TokenMint />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
