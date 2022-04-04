import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Paper,
  Tab,
  Tabs,
  Typography,
  Zoom,
} from "@material-ui/core";
import NewReleases from "@material-ui/icons/NewReleases";
import RebaseTimer from "../../components/RebaseTimer/RebaseTimer";
import TabPanel from "../../components/TabPanel";
import { getOhmTokenImage, getTokenImage, trim } from "../../helpers";
import { changeApproval, changeStake, claimWarmUp,  forfeitWarmUp } from "../../slices/StakeThunk";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import "./stake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import { Skeleton } from "@material-ui/lab";
import ExternalStakePool from "./ExternalStakePool";
import { error } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const sOhmImg = getTokenImage("sohm");
const ohmImg = getOhmTokenImage(16, 16);

function Stake() {
  const dispatch = useDispatch();
  const { provider, address, connected, connect, chainID } = useWeb3Context();

  const [zoomed, setZoomed] = useState(false);
  const [view, setView] = useState(0);
  const view1 = 0;
  const [quantity, setQuantity] = useState("");
  const [oldquantity, setOldQuantity] = useState("");

  const isAppLoading = useSelector(state => state.app.loading);
  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });
  const fiveDayRate = useSelector(state => {
    return state.app.fiveDayRate;
  });
  const oldfiveDayRate = useSelector(state => {
    return state.app.old_fiveDayRate;
  });
  const ohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.wand;
  });
  const oldSohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.oldsohm;
  });
  const shecBalance = useSelector(state => {
    return state.account.balances && state.account.balances.swand;
  });
  const oldshecBalance = useSelector(state => {
    return state.account.balances && state.account.balances.oldshec;
  });
  const wsohmBalance = useSelector(state => {
    return state.account.balances && state.account.balances.wswand;
  });
  const stakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.wandStake;
  });
  const unstakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.wandUnstake;
  });

  const warmUpBalance = useSelector(state => {
    return state.account.staking && state.account.staking.warmUp;
  });

  const warmUpExpiry = useSelector(state => {
    return state.account.staking && state.account.staking.expiry;
  });
  
  const epochNumber = useSelector(state => {
    return state.app.epochNumber;
  });

  const oldunstakeAllowance = useSelector(state => {
    return state.account.staking && state.account.staking.oldhecUnstake;
  });
  const stakingRebase = useSelector(state => {
    return state.app.stakingRebase;
  });
  const oldstakingRebase = useSelector(state => {
    return state.app.old_stakingRebase;
  });
  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });
  const stakingTVL = useSelector(state => {
    return state.app.stakingTVL;
  });

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  const setMax = () => {
    if (view === 0) {
      setQuantity(ohmBalance);
    } else {
      setQuantity(shecBalance);
    }
  };
  const setOldMax = () => {
    setOldQuantity(oldshecBalance);
  };

  const onSeekApproval = async token => {
    
    await dispatch(changeApproval({ address, token, provider, networkID: chainID }));
  };

  const onChangeStake = async (action, isOld) => {
    // eslint-disable-next-line no-restricted-globals
    let value, unstakedVal;
    if (isOld) {
      value = oldquantity;
      unstakedVal = oldshecBalance;
    } else {
      value = quantity;
      unstakedVal = shecBalance;
    }
    if (isNaN(value) || value === 0 || value === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }
    
    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(value, "gwei");
    if (action === "stake" && gweiValue.gt(ethers.utils.parseUnits(ohmBalance, "gwei"))) {
      return dispatch(error("You cannot stake more than your PAL balance."));
    }
    
    if (action === "unstake" && gweiValue.gt(ethers.utils.parseUnits(unstakedVal, "gwei"))) {
      return dispatch(error("You cannot unstake more than your sPAL balance."));
    }
    await dispatch(
      changeStake({
        address,
        action,
        value: value.toString(),
        provider,
        networkID: chainID,
        callback: () => (isOld ? setOldQuantity("") : setQuantity("")),
        isOld: isOld,
      }),
    );
  };

  const hasAllowance = useCallback(
    token => {
      if (token === "ohm") return stakeAllowance > 0;
      if (token === "sohm") return unstakeAllowance > 0;
      if (token === "oldshec") return oldunstakeAllowance > 0;
      return 0;
    },
    [stakeAllowance, unstakeAllowance],
    );

  const onClaim = async () => {
    await dispatch(claimWarmUp({ address, provider, networkID: chainID }));
  };

  const onForfeit = async () => {
    await dispatch(forfeitWarmUp({ address, provider, networkID: chainID }));
  };

    const isAllowanceDataLoading = (stakeAllowance == null && view === 0) || (unstakeAllowance == null && view === 1);

  let modalButton = [];

  modalButton.push(
    <Button variant="contained" color="primary" className="connect-button" onClick={connect} key={1}>
      Connect Wallet
    </Button>,
  );

  const changeView = (event, newView) => {
    setView(newView);
  };

  const trimmedBalance = Number(
    [shecBalance, wsohmBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  const oldtrimmedBalance = Number(
    [oldshecBalance, wsohmBalance]
      .filter(Boolean)
      .map(balance => Number(balance))
      .reduce((a, b) => a + b, 0)
      .toFixed(4),
  );
  
  // const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const trimmedStakingAPY = stakingAPY > 100000000 ? parseFloat(stakingAPY * 100 ) : trim(stakingAPY * 100, 3);
  const stakingRebasePercentage = trim(stakingRebase * 100, 4);
  const oldstakingRebasePercentage = trim(oldstakingRebase * 100, 4);
  const nextRewardValue = trim((stakingRebasePercentage / 100) * trimmedBalance, 4);
  const oldnextRewardValue = trim((oldstakingRebasePercentage / 100) * oldtrimmedBalance, 4);
  let waitingTime = warmUpExpiry - epochNumber;
  if(waitingTime <= 0) 
    waitingTime = 0;
    

  // const preApy = stakingAPY && stakingAPY.toString().split("e+")[0].substring(0, 3);
  // const afterApy = stakingAPY && stakingAPY.toString().split("e+")[1];
  // const tempApy = stakingAPY && preApy.concat("e+").concat(afterApy);
// console.log('debug info', stakingAPY)
  return (
    <>
      <div id="stake-view">
        <Zoom in={true} onEntered={() => setZoomed(true)}>
          <Paper className={`ohm-card`}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <div className="card-header">
                  <Typography variant="h5">Single Stake (3, 3)</Typography>
                  <RebaseTimer />

                  {address && oldSohmBalance > 0.01 && (
                    <Link
                      className="migrate-sohm-button"
                      style={{ textDecoration: "none" }}
                      href="https://docs.hectordao.com/using-the-website/migrate"
                      aria-label="migrate-sohm"
                      target="_blank"
                    >
                      <NewReleases viewBox="0 0 24 24" />
                      <Typography>Migrate sPAL!</Typography>
                    </Link>
                  )}
                </div>
              </Grid>

              <Grid item>
                <div className="stake-top-metrics">
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="stake-apy">
                        <Typography variant="h5" color="textSecondary">
                          APY
                        </Typography>
                        {/* <Typography variant="h4">
                          {stakingAPY ? (
                            <>{new Intl.NumberFormat("en-US", { notation: "scientific" }).format(stakingAPY)}%</>
                            // <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </Typography> */}
                        <Typography variant="h4" style={{"word-break":"break-all", "white-space":"break-spaces"}}>
                          <>{new Intl.NumberFormat("en-US").format(trimmedStakingAPY)}%</>
                        </Typography>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="stake-tvl">
                        <Typography variant="h5" color="textSecondary">
                          Total Value Deposited
                        </Typography>
                        <Typography variant="h4">
                          {stakingTVL ? (
                            new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                              minimumFractionDigits: 0,
                            }).format(stakingTVL)
                          ) : (
                            <Skeleton width="150px" />
                          )}
                        </Typography>
                      </div>
                    </Grid>

                    <Grid item xs={12} sm={4} md={4} lg={4}>
                      <div className="stake-index">
                        <Typography variant="h5" color="textSecondary">
                          Current Index
                        </Typography>
                        <Typography variant="h4">
                          {currentIndex ? <>{trim(currentIndex, 1)} PAL</> : <Skeleton width="150px" />}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              </Grid>

              <div className="staking-area">
                {!address ? (
                  <div className="stake-wallet-notification">
                    <div className="wallet-menu" id="wallet-menu">
                      {modalButton}
                    </div>
                    <Typography variant="h6">Connect your wallet to stake PAL</Typography>
                  </div>
                ) : (
                  <>
                    <Box className="stake-action-area">
                      <Tabs
                        key={String(zoomed)}
                        centered
                        value={view}
                        textColor="primary"
                        indicatorColor="primary"
                        className="stake-tab-buttons"
                        onChange={changeView}
                        aria-label="stake tabs"
                      >
                        <Tab label="Stake" {...a11yProps(0)} />
                        <Tab label="Unstake" {...a11yProps(1)} />
                      </Tabs>

                      <Box className="stake-action-row " display="flex" alignItems="center">
                        {address && !isAllowanceDataLoading ? (
                          (!hasAllowance("ohm") && view === 0) || (!hasAllowance("sohm") && view === 1) ? (
                            <Box className="help-text">
                              <Typography variant="body1" className="stake-note" color="textSecondary">
                                {view === 0 ? (
                                  <>
                                    First time staking <b>PAL</b>?
                                    <br />
                                    Please approve Paladin DAO to use your <b>PAL</b> for staking.
                                  </>
                                ) : (
                                  <>
                                    First time unstaking <b>sPAL</b>?
                                    <br />
                                    Please approve Paladin DAO to use your <b>sPAL</b> for unstaking.
                                  </>
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <FormControl className="ohm-input" variant="outlined" color="primary">
                              <InputLabel htmlFor="amount-input"></InputLabel>
                              <OutlinedInput
                                id="amount-input"
                                type="number"
                                placeholder="Enter an amount"
                                className="stake-input"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                labelWidth={0}
                                endAdornment={
                                  <InputAdornment position="end">
                                    <Button variant="text" onClick={setMax} color="inherit">
                                      Max
                                    </Button>
                                  </InputAdornment>
                                }
                              />
                            </FormControl>
                          )
                        ) : (
                          <Skeleton width="150px" />
                        )}

                        <TabPanel value={view} index={0} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("ohm") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "staking")}
                              onClick={() => {
                                onChangeStake("stake", false);
                              }}
                            >
                              {txnButtonText(pendingTransactions, "staking", "Stake PAL")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_staking")}
                              onClick={() => {
                                onSeekApproval("ohm");
                                console.log('seekApproval');
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_staking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                        <TabPanel value={view} index={1} className="stake-tab-panel">
                          {isAllowanceDataLoading ? (
                            <Skeleton />
                          ) : address && hasAllowance("sohm") ? (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "unstaking")}
                              onClick={() => {
                                onChangeStake("unstake", false);
                              }}
                            >
                              {txnButtonText(pendingTransactions, "unstaking", "Unstake PAL")}
                            </Button>
                          ) : (
                            <Button
                              className="stake-button"
                              variant="contained"
                              color="primary"
                              disabled={isPendingTxn(pendingTransactions, "approve_unstaking")}
                              onClick={() => {
                                onSeekApproval("sohm");
                              }}
                            >
                              {txnButtonText(pendingTransactions, "approve_unstaking", "Approve")}
                            </Button>
                          )}
                        </TabPanel>
                      </Box>
                    </Box>

                    <div className={`stake-user-data`}>
                    <div className="data-row">
                        <Typography variant="body1">Your Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(ohmBalance, 4)} PAL</>}
                        </Typography>
                      </div>
                      <div className="data-row">
                        <Typography variant="body1">Your Warm Up Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{warmUpBalance} sPAL</>}
                        </Typography>
                      </div>
                      <div className="data-row">
                        <Typography variant="body1">Your Waiting Time to claim</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{waitingTime > 0 ? waitingTime : 0} Epoch</>}
                        </Typography>
                      </div>
                      <div style={{overflow: 'hidden'}}>
                      {epochNumber >= warmUpExpiry?
                      (                      
                      <Button
                        className="claim-button"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          onClaim();
                        }}
                        style={{float: "right"}}
                      >
                      Claim
                      </Button>):
                      (                      
                      <Button
                        className="claim-button"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          onForfeit();
                        }}
                        style={{float: "right"}}
                      >
                      Exit WarmUp
                      </Button>)
                      }
                      </div>
                      <div className="data-row">
                        <Typography variant="body1">Your Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(ohmBalance, 4)} PAL</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Your Staked Balance</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trimmedBalance} sPAL</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Amount</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{nextRewardValue} sPAL</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">Next Reward Yield</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{stakingRebasePercentage}%</>}
                        </Typography>
                      </div>

                      <div className="data-row">
                        <Typography variant="body1">ROI (5-Day Rate)</Typography>
                        <Typography variant="body1">
                          {isAppLoading ? <Skeleton width="80px" /> : <>{trim(fiveDayRate * 100, 4)}%</>}
                        </Typography>
                      </div>

                      <div className="data-display">
                        <Typography variant="body1">
                          Note: You can claim after 3 epoch. Meanwhile you receive the rewards. If you exit warm up, you only receive the deposite amount.
                         </Typography>
                      </div>

                    </div>
                  </>
                )}
              </div>
            </Grid>
          </Paper>
        </Zoom>
      </div>
    </>
  );
}

export default Stake;
