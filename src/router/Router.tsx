import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../Pages/Main";
import Login from "../Pages/Login";
import TokenMint from "../Pages/Token/TokenMint";

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

import { Tokenomics } from "../Pages/Tokenomics/Tokenomics";
import { Vesting } from "../Pages/Tokenomics/Vesting";
import { VestingList } from "../Pages/Tokenomics/VestingList";
import CreateMarketplace from "../Pages/Marketplace/CreateMarketplace";
import MarketplaceManager from "../Pages/Marketplace/MarketplaceManager";
import ApproveNFT from "../Pages/NFT/ApproveNFT";
import ListMarketplace from "../Pages/Marketplace/ListMarketplace";
import AddNftToMarketplace from "../Pages/Marketplace/AddNftToMarketplace";
import BuyNft from "../Pages/Marketplace/BuyNft";
import ManageRaffle from "../Pages/Raffle/ManageRaffle";
import { Stake } from "../Pages/Stake/Stake";
import Lootbox from "../Pages/NFT/Lootbox";

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
            <Route path="/tokenomics" index element={<Tokenomics />} />
            <Route path="/vesting-list" index element={<VestingList />} />
            <Route path="/create-vesting/:tokenid/:name/:amount" index element={<Vesting />} />
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
            <Route path="/create-nft/:collectionHash?" index element={<CreateNft />} />
            <Route path="/nft-list/:collectionHash" index element={<NftList />} />
            <Route path="/approve-nft" index element={<ApproveNFT />} />
            <Route path="/lootbox" index element={<Lootbox />}></Route>
            {/* MARKETPLACE */}
            <Route path="/marketplace" index element={<ListMarketplace />} />
            <Route path="/create-marketplace" index element={<CreateMarketplace />} />
            <Route path="/marketplace/:marketplaceHash" index element={<MarketplaceManager />} />
            <Route path="/add-nft-to-marketplace/:marketplaceHash" index element={<AddNftToMarketplace />} />
            <Route path="/buy-nft" index element={<BuyNft />} />
            {/* RAFFLE */}
            <Route path="/manage-raffle" index element={<ManageRaffle />} />

            {/* STAKE */}

            <Route path="/stake" index element={<Stake />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
