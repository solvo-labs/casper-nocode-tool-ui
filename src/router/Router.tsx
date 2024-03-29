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
import StakeCasper from "../Pages/Stake/StakeCasper";
import CreateLootbox from "../Pages/NFT/CreateLootbox";
import MyLootboxes from "../Pages/NFT/MyLootboxes";
import { LootboxList } from "../Pages/NFT/LootboxList";
import JoinRaffle from "../Pages/Raffle/JoinRaffle";
import MergeNFT from "../Pages/NFT/MergeNFT";
import TimeableNFT from "../Pages/NFT/TimableNFT";
import StakeCep18Token from "../Pages/Stake/StakeCep18Token";
import ManageStakes from "../Pages/Stake/ManageStakes";
import JoinStakes from "../Pages/Stake/JoinStakes";

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
            <Route path="/create-lootbox" index element={<CreateLootbox />} />
            <Route path="/my-lootboxes" index element={<MyLootboxes />} />
            <Route path="/merge-nft" index element={<MergeNFT />} />
            <Route path="/timeable-nfts" index element={<TimeableNFT />} />
            {/* MARKETPLACE */}
            <Route path="/marketplace" index element={<ListMarketplace />} />
            <Route path="/create-marketplace" index element={<CreateMarketplace />} />
            <Route path="/marketplace/:marketplaceHash" index element={<MarketplaceManager />} />
            <Route path="/add-nft-to-marketplace/:marketplaceHash" index element={<AddNftToMarketplace />} />
            <Route path="/buy-nft" index element={<BuyNft />} />
            <Route path="/buy-lootbox" index element={<LootboxList />} />
            <Route path="/join-raffle" index element={<JoinRaffle />} />
            {/* RAFFLE */}
            <Route path="/manage-raffle" index element={<ManageRaffle />} />

            {/* STAKE */}

            <Route path="/stake-casper" index element={<StakeCasper />} />
            <Route path="/stake-cep18-token" index element={<StakeCep18Token />} />
            <Route path="/manage-stake" index element={<ManageStakes />} />
            <Route path="/join-stakes" index element={<JoinStakes />} />
          </Route>
          <Route path="/login" index element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default Router;
