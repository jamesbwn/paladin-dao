import { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Zoom,
  useMediaQuery,
  Button,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useDispatch, useSelector } from "react-redux";
import { trim, formatCurrency } from "../../helpers";
import { error } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";

import "./nftstake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { onUnStakeAll, onHarvest } from "src/slices/NftMintSlice";
import NftCard from "./NftCard";

function NftStake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();
  const isAppLoading = useSelector(state => state.nftMint.loading);

  const [zoomed, setZoomed] = useState(false);
  const btnVarient = false ? "contained" : "outlined";
  const [statusText, setStatusText] = useState("Staked Only");
  const [stakedStatus, setStakedStatus] = useState(true);

  const handleChange = stakedStatus => {
    setStatusText(stakedStatus ? "Unstaked Only" : "Staked Only");
    setStakedStatus(!stakedStatus);
  };

  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const price = useSelector(state => {
    return state.nftMint.price;
  });

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });

  // const rewardPrice = useSelector(state => {
  //   return state.nftMint.rewardPrice;
  // });

  const rewardRate = useSelector(state => {
    return state.nftMint.rewardRate;
  });

  const boostingSum = useSelector(state => {
    return state.nftMint.boostingSum;
  });

  const tokensOfOwner = useSelector(state => {
    return state.nftMint.tokensOfOwner;
  });

  const balanceOf = useSelector(state => {
    return state.nftMint.balanceOf;
  });

  const stakedTokens = useSelector(state => {
    return state.nftMint.stakedTokens;
  });

  const earned = useSelector(state => {
    return state.nftMint.earned;
  });

  const totalSupplyForStaking = useSelector(state => {
    return state.nftMint.totalSupplyForStaking;
  });

  const maxSupply = useSelector(state => {
    return state.nftMint.maxSupply;
  });

  let apr = useSelector(state => {
    return state.nftMint.apr;
  });

  const bnbPrice = useSelector(state => {
    return state.nftMint.bnbPrice;
  });

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const unStakeAll = async () => {
    await dispatch(
      onUnStakeAll({
        address,
        provider,
        networkID: chainID,
      }),
    );
  };

  const harvest = async () => {
    await dispatch(
      onHarvest({
        address,
        provider,
        networkID: chainID,
      }),
    );
  };

  if(price != 0 && bnbPrice !=0 ) {
    apr = apr * marketPrice / price / bnbPrice;
  } else {
    apr = 0;
  }
  console.log('debug apr', apr, marketPrice, price, bnbPrice )
  return (
    <>
      <div id="stake-view">
        <Paper className={`ohm-card`}>
          {/* <Grid container columns={{ xs: 4, sm: 8, md: 12 }} style={{ textAlign: "center" }}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" color="textSecondary">
                TVL
              </Typography>
              <Typography variant="h4" style={{ color: "#FFAE00" }}>
                {totalSupplyForStaking ? parseInt(totalSupplyForStaking) : 0}TPM
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" color="textSecondary">
                Earned
              </Typography>
              <Typography variant="h4" style={{ color: "#FFAE00" }}>
                $
                {earned
                  ? "TPAL"
                  : "0"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h5" color="textSecondary">
                APR
              </Typography>
              <Typography variant="h4" style={{ color: "#FFAE00" }}>
                {apr
                  ? (boostingSum > 0 ? boostingSum * apr : apr )
                  : 0}
                %
              </Typography>
            </Grid>
          </Grid> */}
          <Box className={`hero-metrics`}>
            <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" textAlign="center">
              <Box className="metric circ">
                <Typography variant="h6" color="textSecondary">
                  Staked / Total
                </Typography>
                <Typography variant="h5">
                  {totalSupplyForStaking && maxSupply ? (
                    parseInt(totalSupplyForStaking) + " / " + parseInt(maxSupply)
                  ) : (
                    <Skeleton type="text" />
                  )}
                </Typography>
              </Box>

              <Box className="metric price">
                <Typography variant="h6" color="textSecondary">
                Reward Price
                </Typography>
                <Typography variant="h5">
                  {/* appleseed-fix */}
                  {marketPrice ? formatCurrency(marketPrice, 3) : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric wsoprice">
                <Typography variant="h6" color="textSecondary">
                  Reward Rate
                </Typography>

                <Typography variant="h5">
                  {rewardRate ? ethers.utils.formatUnits(rewardRate, "gwei") : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric market">
                <Typography variant="h6" color="textSecondary">
                  APR
                </Typography>
                <Typography variant="h5">
                  {apr && ( boostingSum > 0 ? trim( (1 + boostingSum / 100) * apr, 3) + "%" : trim(apr, 3) + "%" ) }
                  {!apr && <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric index">
                <Typography variant="h6" color="textSecondary">
                  Availabe for Harvest
                </Typography>
                <Typography variant="h5">
                  {earned ? (boostingSum > 0 ? trim( (1 + boostingSum / 100) * earned / Math.pow(10, 9), 3) + " PAL" : trim(earned, 2) + " PAL") : <Skeleton type="text" />}
                </Typography>
              </Box>

              <Box className="metric bpo">
                <Typography variant="h6" color="textSecondary">
                  Boosting Percentage
                </Typography>
                <Typography variant="h5">
                  {boostingSum ? trim(boostingSum, 3) + "%" : <Skeleton type="text" />}
                </Typography>
              </Box>

            </Box>
        </Box>
          {earned && parseInt(earned) !== 0 ? (
            <Box style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <Button
                variant={btnVarient}
                color="primary"
                style={{ width: "30%" }}
                onClick={() => {
                  harvest();
                }}
              >
                <Typography variant="h6">Harvest</Typography>
              </Button>
            </Box>
          ) : (
            <></>
          )}
        </Paper>
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid item>
              <div className="card-header">
                <Typography variant="h5">My NFT</Typography>
              </div>
            </Grid>

            {address ? (
              tokensOfOwner && (tokensOfOwner.length !== 0 || stakedTokens.length !== 0) ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={stakedStatus}
                          onChange={() => {
                            handleChange(stakedStatus);
                          }}
                        />
                      }
                      label={statusText}
                    />
                    <Box style={{ display: "flex", justifyContent: "space-between" }}>
                      {stakedStatus ? (
                        <Button
                          variant={btnVarient}
                          color="primary"
                          style={{ width: "30%" }}
                          onClick={() => {
                            unStakeAll();
                          }}
                        >
                          <Typography variant="h6">Unstake All</Typography>
                        </Button>
                      ) : (
                        <>
                          {/* <Button variant={btnVarient} color="primary" style={{ width: "30%" }} onClick={() => {approveAll();}}>
                            <Typography variant="h6">Approve All</Typography>
                          </Button>
                          <Button variant={btnVarient} color="primary" style={{ width: "30%" }}>
                            <Typography variant="h6">Stake All</Typography>
                          </Button> */}
                        </>
                      )}
                    </Box>
                  </div>

                  <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                    {stakedStatus ? (
                      balanceOf ? (
                        stakedTokens.map(index => {
                          return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <NftCard id={parseInt(index)} staked={true} />
                            </Grid>
                          );
                        })
                      ) : (
                        <></>
                      )
                    ) : (
                      tokensOfOwner.map(index => {
                        return (
                          <Grid item xs={12} sm={6} md={4} key={index}>
                            <NftCard id={parseInt(index)} staked={false} />
                          </Grid>
                        );
                      })
                    )}
                  </Grid>
                </div>
              ) : (
                <></>
              )
            ) : (
              <div className="stake-wallet-notification">
                <div className="wallet-menu" id="wallet-menu">
                  {modalButton}
                </div>
                <Typography variant="h6">Connect your wallet to stake NFT</Typography>
              </div>
            )}
          </Paper>
        </Zoom>
      </div>
    </>
  );
}

export default NftStake;
