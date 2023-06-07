import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../Pages/Login";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route element={<ProtectedRoute />}></Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
