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
import { CreateCollection } from "../Pages/NFT/CreateCollection";
import { MyCollections } from "../Pages/NFT/MyCollections";
import { CreateNft } from "../Pages/NFT/CreateNft";
import { NftList } from "../Pages/NFT/NftList";
import { MyNFTs } from "../Pages/NFT/MyNFTs";

const Router: React.FC = () => {
  return (
    <>
      <BrowserRouter basename={"/"}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" index element={<Main />} />

            {/* TOKENS */}
            <Route path="/token" index element={<TokenMint />} />
            <Route path="/my-tokens" index element={<MyTokens />} />
            <Route path="/transfer" index element={<Transfer />} />
            <Route path="/transfer-from" index element={<TransferFrom />} />
            <Route path="/approve" element={<Approve />} />
            <Route path="/mint-and-burn" element={<MintAndBurn />} />
            <Route path="/allowance" element={<Allowance />} />
            <Route path="/increase-decrease-allowance" element={<IncreaseDecreaseAllowance />} />

            {/* NFTS */}
            <Route path="/create-collection" index element={<CreateCollection />} />
            <Route path="/my-collections" index element={<MyCollections />} />
            <Route path="/my-nfts" index element={<MyNFTs />} />
            <Route path="/create-nft" index element={<CreateNft />} />
            <Route path="/nft-list/:collectionHash" index element={<NftList />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
