import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useDispatch, useSelector } from "react-redux";
import { trim, formatCurrency } from "../../helpers";
import { ethers, BigNumber } from "ethers";
import { abi as PalNftABI } from "../../abi/PalNft.json";
import { abi as PalNftInfoABI } from "../../abi/PalNftInfo.json";
import { addresses } from "../../constants";

import "./nftstake.scss";
import { useWeb3Context } from "src/hooks/web3Context";
import { onStake, onUnStake, onApprove } from "src/slices/NftMintSlice";

function NftCard({ id, staked }) {
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [isApproved, setIsApproved] = useState("");
  const [boostValue, setBoostValue] = useState("");
  const { provider, address, connected, connect, chainID } = useWeb3Context();
  const btnVarient = false ? "disabled" : "outlined";
  const _baseURI = useSelector(state => {
    return state.nftMint._baseURI;
  });

  const PalNftContract = new ethers.Contract(addresses[chainID].PALNFT_ADDRESS, PalNftABI, provider);
  const PalNftInfoContract = new ethers.Contract(addresses[chainID].PALNFTINFO_ADDRESS, PalNftInfoABI, provider);

  // useEffect(() => {
  //   const boostValue = await PalNftInfoContract.getBoostValue(id);
  //   console.log('debug boostValue', boostValue)
  //   setBoostValue(boostValue)
  // }, [id])

  dispatch(async () => {
    const boostValue = await PalNftInfoContract.getBoostValue(id);
    console.log('debug boostValue', boostValue)
    setBoostValue(boostValue)
  });


  dispatch(async () => {
    const getApproved = await PalNftContract.getApproved(id);
    setIsApproved(getApproved);
  });

  const jsonUrl = _baseURI + id + ".json";
  // console.log('debug json', jsonUrl)
  useEffect(() => {
    fetch(jsonUrl)
      .then(res => res.json())
      .then(
        result => {
          setImageUrl(result.image);
          setImageName(result.name);
        },
        error => {
          console.log("debig fetch uri error", error);
        },
      );
  }, []);

  const stake = async () => {
    await dispatch(
      onStake({
        address,
        value: id.toString(),
        provider,
        networkID: chainID,
      }),
    );
  };

  const unStake = async () => {
    await dispatch(
      onUnStake({
        address,
        value: id.toString(),
        provider,
        networkID: chainID,
      }),
    );
  };

  const approve = async () => {
    await dispatch(
      onApprove({
        address,
        value: id.toString(),
        provider,
        networkID: chainID,
      }),
    );
  };
  //  https://ipfs.io//ipfs://Qmc4YG4t1TM7rsUX6QquwQ4qaDjtYX4nPhvxfu93jy3ZZ7/16.png
  // https://ipfs.io/ipfs/Qmc4YG4t1TM7rsUX6QquwQ4qaDjtYX4nPhvxfu93jy3ZZ7/16.png
// console.log('debug img', imageUrl, imageName)
  return (
    <>
      <Card style={{ padding: "10px", border: "1px solid #FFAE00", cursor: "pointer"}}>
        <CardMedia
          component="img"
          height="200"
          width="200"
          image={imageUrl}
          alt={imageName}
        />
        <CardContent>
        <Typography gutterBottom variant="h5" component="div" style={{ textAlign: "center" }}>
          Boost  {boostValue}%
          </Typography>
          <Typography gutterBottom variant="h5" component="div" style={{ textAlign: "center" }}>
            {imageName}
          </Typography>
        </CardContent>
        {staked ? (
          <Button
            variant={btnVarient}
            color="primary"
            style={{ width: "100%" }}
            onClick={() => {
              unStake();
            }}
          >
            <Typography variant="h6">Unstake</Typography>
          </Button>
        ) : isApproved ? (
          isApproved.toString() === addresses[chainID].PALNFTSTAKING_ADDRESS ? (
            <Button
              variant={btnVarient}
              color="primary"
              style={{ width: "100%" }}
              onClick={() => {
                stake();
              }}
            >
              <Typography variant="h6">Stake</Typography>
            </Button>
          ) : (
            <Button
              variant={btnVarient}
              color="primary"
              style={{ width: "100%" }}
              onClick={() => {
                approve();
              }}
            >
              <Typography variant="h6">Approve</Typography>
            </Button>
          )
        ) : (
          <></>
        )}
      </Card>
    </>
  );
}

export default NftCard;
