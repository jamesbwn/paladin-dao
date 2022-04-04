export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/raxioma/paladin-v2";
export const EPOCH_INTERVAL = 9600;

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 3;

export const TOKEN_DECIMALS = 9;

export const POOL_GRAPH_URLS = {
  4: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
  1: "https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3",
};

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  56: {
    BUSD_ADDRESS: "0xe9e7cea3dedca5984780bafc599bd69add087d56", // duplicate
    USDT_ADDRESS: "0x55d398326f99059ff775485246999027b3197955",
    WAND_ADDRESS: "0xB4dA413D7643000A84C5B62Bfb1bF2077604b165",
    SWAND_ADDRESS: "0xFF55759cbceA32Ac28C3317E9115B5Ee8f9fA0FB",
    STAKING_ADDRESS: "0x7B73d56c53059699003ac11aF4308f6bEb4877FF", // The new staking contract
    STAKING_HELPER_ADDRESS: "0xF745dbB49ff3Dc78eFcD223d2064690D02516F9C", // Helper contract used for Staking only
    BONDINGCALC_ADDRESS: "0xD8dcE26DEdE9539Afe79D366478973eb47cF048D",
    TREASURY_ADDRESS: "0x6382192259f45a7acDa2A08cc30ce9FaF0e1863E",
    PRESALE_TOKEN_ADDRESS: "0x5217c6e7e38cf567bb6b77c8cad8661ba863bd53",
    CONVERT_ADRESS: "0x345fcD87bccf3455448F0E8F374A4291e48ccD66",
    BUSD_PAL_ADDRESS: "0x103900036E483C85EA4748B6733f621B8df21e2d",

    OLD_STAKING_ADDRESS: "0x9ae7972BA46933B3B20aaE7Acbf6C311847aCA40", //#
    OLD_STAKING_HELPER_ADDRESS: "0x2ca8913173D36021dC56922b5db8C428C3fdb146", //#
    OLD_SWAND_ADDRESS: "0x36F26880C6406b967bDb9901CDe43ABC9D53f106", //#
    MIGRATE_ADDRESS: "0xC7f56EC779cB9e60afA116d73F3708761197dB3d", //#
    DISTRIBUTOR_ADDRESS: "0x59D9CF509366C750A2123B47FfA8EB4504738649", //#
    BONDINGCALC_ADDRESS1: "0x7D8Dc5F89089D44a776F5D1047f4C8565C3DF091", //#
    REDEEM_HELPER_ADDRESS: "0x8D1906D112008f7C29A719F06dc62904a1136126",
    PT_TOKEN_ADDRESS: "0x0E930b8610229D74Da0A174626138Deb732cE6e9", // #  33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
    PT_PRIZE_POOL_ADDRESS: "0xEaB695A8F5a44f583003A8bC97d677880D528248", // #  NEW
    PT_PRIZE_STRATEGY_ADDRESS: "0xf3d253257167c935f8C62A02AEaeBB24c9c5012a", //#   NEW
    
    BNBBUSDLP_ADDRESS: "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16",
    PALNFT_ADDRESS: "0x69BfAF1096605b9DB8c914B6a71Fa6558e5ed14E", // test version
    PALNFTINFO_ADDRESS: "0x0ee93Bd6C3A5A3BE31320E2DbC4c25be393b5BCa", // test version
    PALNFTSTAKING_ADDRESS: "0x4700CDC2cc852C734Cb0c97Bba3B0F8e4eBC59eB", // test version
  },
  97: {
    BUSD_ADDRESS: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C", // duplicate
    WAND_ADDRESS: "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932",
    SWAND_ADDRESS: "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084",
    STAKING_ADDRESS: "0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2",
    STAKING_HELPER_ADDRESS: "0xf73f23Bb0edCf4719b12ccEa8638355BF33604A1",
    OLD_STAKING_ADDRESS: "0xb640AA9082ad720c60102489b806E665d67DCE32",
    WSOHM_ADDRESS: "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad",
    OLD_SOHM_ADDRESS: "0x8Fc4167B0bdA22cb9890af2dB6cB1B818D6068AE",
    MIGRATE_ADDRESS: "0x3BA7C6346b93DA485e97ba55aec28E8eDd3e33E2",
    BONDINGCALC_ADDRESS: "0xaDBE4FA3c2fcf36412D618AfCfC519C869400CEB",
    CIRCULATING_SUPPLY_ADDRESS: "0x5b0AA7903FD2EaA16F1462879B71c3cE2cFfE868",
    TREASURY_ADDRESS: "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7",
    REDEEM_HELPER_ADDRESS: "0xBd35d8b2FDc2b720842DB372f5E419d39B24781f",
    DISTRIBUTOR_ADDRESS: "0x0626D5aD2a230E05Fb94DF035Abbd97F2f839C3a",
    PT_TOKEN_ADDRESS: "0x0a2d026bacc573a8b5a2b049f956bdf8e5256cfd", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
    PT_PRIZE_POOL_ADDRESS: "0xf9081132864ed5e4980CFae83bDB122d86619281", // NEW
    PT_PRIZE_STRATEGY_ADDRESS: "0x2Df17EA8D6B68Ec444c9a698315AfB36425dac8b", // NEW
  },
};
