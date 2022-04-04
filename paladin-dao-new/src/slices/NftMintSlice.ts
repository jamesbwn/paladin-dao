import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as PalNftABI } from "../abi/PalNft.json";
import { abi as PalNftInfoABI } from "../abi/PalNftInfo.json";
import { abi as PalNftStakingABI } from "../abi/PalNftStaking.json";
import { abi as Pair } from "../abi/PairContract.json";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import apollo from "../lib/apolloClient.js";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { error, info } from "../slices/MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError, IIdAsyncThunk } from "./interfaces";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./PendingTxnsSlice";
import { fetchAccountSuccess, getBalances, loadAccountDetails } from "./AccountSlice";
import { useWeb3Context } from "src/hooks/web3Context";
import { useEffect, useState } from "react";

export const loadNftMintDetails = createAsyncThunk(
  "nftMint/loadNftMintDetails",
  async ({ address, provider, networkID }: IChangeApprovalAsyncThunk, { dispatch }) => {
    const PalNftContract = new ethers.Contract(addresses[networkID].PALNFT_ADDRESS as string, PalNftABI, provider);
    // const PalNftInfoContract = new ethers.Contract(addresses[networkID].PALNFTINFO_ADDRESS as string, PalNftInfoABI, provider);
    const PalNftStakingContract = new ethers.Contract(addresses[networkID].PALNFTSTAKING_ADDRESS as string, PalNftStakingABI, provider);
    const PairContract = new ethers.Contract(addresses[networkID].BNBBUSDLP_ADDRESS as string, Pair, provider);
    const reserve = await PairContract.getReserves();
    
    const price = (await PalNftContract.price()) / Math.pow(10, 18);
    
    const totalSupply = await PalNftContract.totalSupply();
    const maxSupply = await PalNftContract.MAX_SUPPLY();
    const maxPerTx = await PalNftContract.maxPerTx();
    const isPaused = await PalNftContract.isPaused();
    const _baseURI = await PalNftContract._baseURI();
    const tokensOfOwner = await PalNftContract.tokensOfOwner(address);
    const earned = await PalNftStakingContract.earned(address);
    const balanceOf = await PalNftStakingContract.balanceOf(address);
    const rewardRate = await PalNftStakingContract.rewardRate();
    const totalSupplyForStaking = await PalNftStakingContract.totalSupply();
    const boostingSum = await PalNftStakingContract.boostingSum(address);
    const whiteListed = await PalNftContract.whiteListed(address);

    const day2Time = 86400;
    let apr
    if(totalSupplyForStaking != 0) {
      apr = rewardRate.mul(day2Time).div(totalSupplyForStaking).div(Math.pow(10, 9))
    }
    else {
      apr = 0
    }
    const bnbPrice = reserve[1] / reserve[0];
    let stakedTokens = []
    for (let index = 0; index < parseInt(balanceOf); index++) {
      let tokensOfOwnerByIndex = await PalNftStakingContract.tokenOfOwnerByIndex(address, index);
      stakedTokens.push(tokensOfOwnerByIndex)
    }

    if (!provider) {
      console.error("failed to connect to provider, please connect your wallet");
      return {
        price,
      };
    }
    // console.log('debug nft info end', totalSupply, boostingSum)
    return {
      price,
      totalSupply,
      maxSupply,
      maxPerTx,
      isPaused,
      _baseURI,
      tokensOfOwner,
      balanceOf,
      stakedTokens,
      earned,
      totalSupplyForStaking,
      apr,
      bnbPrice,
      boostingSum,
      rewardRate,
      whiteListed,
    } as INftMintData;
  },
);

interface INftMintData {
  readonly price: number;
  readonly totalSupply: number;
  readonly maxSupply: number;
  readonly maxPerTx: number;
  readonly isPaused: boolean;
  readonly _baseURI: string;
  readonly tokensOfOwner: number[];
  readonly balanceOf: number;
  readonly stakedTokens: number[];
  readonly earned: number;
  readonly totalSupplyForStaking: number;
  readonly apr: number;
  readonly bnbPrice: number;
  readonly boostingSum: number;
  readonly rewardRate: number;
  readonly whiteListed: boolean;
}

const initialState = {
  loading: false,
};

const nftMintSlice = createSlice({
  name: "nftMint",
  initialState,
  reducers: {
    fetchNftMintSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadNftMintDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadNftMintDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadNftMintDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.nftMint;

export default nftMintSlice.reducer;

export const { fetchNftMintSuccess } = nftMintSlice.actions;

export const getNftMintState = createSelector(baseInfo, nftMint => nftMint);

export const changeMintNft = createAsyncThunk(
  "nftMint/changeMintNft",
  async ({ action, value, provider, address, networkID, callback }: IActionValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    let palNft;
    palNft = new ethers.Contract(addresses[networkID].PALNFT_ADDRESS as string, PalNftABI, signer);
    const PalNftContract = new ethers.Contract(addresses[networkID].PALNFT_ADDRESS as string, PalNftABI, provider);
    const price = await PalNftContract.price();
    const ethValue = parseInt(value) * Number(price);
    // console.log(PalNftContract, ethValue);
    let stakeTx;
    // console.log(value)
    try {
      stakeTx = await palNft.mint(value, { value: ethValue });
      // dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: "nftMinting" }));
      callback?.();
      await stakeTx.wait();
      await new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            await dispatch(loadAccountDetails({ networkID, address, provider }));
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 5000);
      });
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("Sale is not active."));
      } else {
        dispatch(error(rpcError.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);

export const useFetchURI = createAsyncThunk(
  "nftMint/useFetchURI",
  async ({ value, address, provider }: IIdAsyncThunk, { dispatch }) => {
    const [tokenURI, setTokenURI] = useState("");
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }
    fetch(value)
      .then(res => res.json())
      .then(
        result => {
          setTokenURI(result.image);
        },
        error => {
          console.log("debig fetch uri error", error);
        },
      );
    return tokenURI;
  },
);

export const onStake = createAsyncThunk(
  "nftMint/onStake",
  async ({ value, address, provider, networkID }: IIdAsyncThunk, { dispatch }) => {
    let palNftStaking;
    const signer = provider.getSigner();
    palNftStaking = new ethers.Contract(addresses[networkID].PALNFTSTAKING_ADDRESS, PalNftStakingABI, signer);
    let stakeTx;
    try {
      stakeTx = await palNftStaking.stake(value);
      await stakeTx.wait();
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      console.error(rpcError)
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("transfer caller is not approved"));
      } else {
        dispatch(error(rpcError.data.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);

export const onUnStake = createAsyncThunk(
  "nftMint/onUnStake",
  async ({ value, address, provider, networkID }: IIdAsyncThunk, { dispatch }) => {
    let palNftStaking;
    const signer = provider.getSigner();
    palNftStaking = new ethers.Contract(addresses[networkID].PALNFTSTAKING_ADDRESS, PalNftStakingABI, signer);
    let stakeTx;
    try {
      stakeTx = await palNftStaking.exit(value);
      await stakeTx.wait();
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      console.error(rpcError)
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("transfer caller is not approved"));
      } else {
        dispatch(error(rpcError.data.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);

export const onApprove = createAsyncThunk(
  "nftMint/onApprove",
  async ({ value, address, provider, networkID }: IIdAsyncThunk, { dispatch }) => {
    const signer = provider.getSigner();
    let palNft;
    palNft = new ethers.Contract(addresses[networkID].PALNFT_ADDRESS as string, PalNftABI, signer);



    let stakeTx;
    try {
      stakeTx = await palNft.approve( addresses[networkID].PALNFTSTAKING_ADDRESS, value);
      await stakeTx.wait();
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      console.error(rpcError)
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("transfer caller is not approved"));
      } else {
        dispatch(error(rpcError.data.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);

export const onUnStakeAll = createAsyncThunk(
  "nftMint/onUnStakeAll",
  async ({ address, provider, networkID }: IIdAsyncThunk, { dispatch }) => {
    let palNftStaking;
    const signer = provider.getSigner();
    palNftStaking = new ethers.Contract(addresses[networkID].PALNFTSTAKING_ADDRESS, PalNftStakingABI, signer);
    let stakeTx;
    try {
      stakeTx = await palNftStaking.exitAll();
      await stakeTx.wait();
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      console.error(rpcError)
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("transfer caller is not approved"));
      } else {
        dispatch(error(rpcError.data.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);

export const onHarvest = createAsyncThunk(
  "nftMint/onHarvest",
  async ({ address, provider, networkID }: IIdAsyncThunk, { dispatch }) => {
    let palNftStaking;
    const signer = provider.getSigner();
    palNftStaking = new ethers.Contract(addresses[networkID].PALNFTSTAKING_ADDRESS, PalNftStakingABI, signer);
    let stakeTx;
    try {
      stakeTx = await palNftStaking.getReward();
      await stakeTx.wait();
    } catch (e: unknown) {
      const rpcError = e as IJsonRPCError;
      console.error(rpcError)
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("transfer caller is not approved"));
      } else {
        dispatch(error(rpcError.data.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
  },
);