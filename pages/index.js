import React, { useState, useEffect } from 'react';
import { ConnectWallet, useAddress, useContract, useTokenBalance, useContractRead, Web3Button } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";

export default function Home() {

  const stakingContractAddress = "0x78477F7125985a4B082C846E749E584692130F1c";
  const stakingTokenAddress = "0x562d8e607bed7fc183ca84c0362c853680b99638";
  const rewardTokenAddress = "0xE40d3f2C40538c0c8e289979E1932Ec1aB0c12da";
  const address = useAddress();
  const [amountToStake, setAmountToStake] = useState(0);
  
  // initialize contracts
  
  const { contract: staking, isLoading: isStakingLoading } = useContract(
    stakingContractAddress,
    "staking"
  );
  
  const { contract: stakingToken, isLoading: isStakingTokenLoading } =
    useContract(stakingTokenAddress, "token");
    
  const { contract: rewardToken, isLoading: isRewardTokenLoading } = useContract(
    rewardTokenAddress,
    "token"
  );
  
  // token balances
  
  const { data: stakingTokenBalance, refetch: refetchStakingTokenBalance } =
    useTokenBalance(stakingToken, address);
  
  const { data: rewardTokenBalance, refetch: refetchRewardTokenBalance } =
    useTokenBalance(rewardToken, address);
  
  // get staking data
  
  const {
    data: stakeInfo,
    refetch: refetchStakingInfo,
    isLoading: isStakeInfoLoading,
  } = useContractRead(staking, "getStakeInfo", address || "0");
  
  const refetchData = () => {
    refetchRewardTokenBalance();
    refetchStakingTokenBalance();
    refetchStakingInfo();
  };

  useEffect(() => {
    setInterval(() => {
      refetchData();
    }, 10000);
  }, []);
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>

        <div className={styles.connect}>
          <ConnectWallet/>
        </div>

        <div className={styles.stakeContainer}>

          <input
            className={styles.textbox}
            type="number"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
          />
          
          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await stakingToken.setAllowance(
                stakingContractAddress,
                amountToStake
              );
              await contract.call(
                "stake",
                ethers.utils.parseEther(amountToStake)
              );
              alert("Tokens staked successfully!");
            }}
          >Stake!</Web3Button>
          
          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call(
                "withdraw",
                ethers.utils.parseEther(amountToStake)
              );
              alert("Tokens unstaked successfully!");
            }}
          >Unstake!</Web3Button>
          
          <Web3Button
            className={styles.button}
            contractAddress={stakingContractAddress}
            action={async (contract) => {
              await contract.call("claimRewards");
              alert("Rewards claimed successfully!");
            }}
          >Claim rewards!</Web3Button>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Stake token balance</h2>
            <p>{stakingTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Reward token balance</h2>
            <p>{rewardTokenBalance?.displayValue}</p>
          </a>

          <a className={styles.card}>
            <h2>Staked amount</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[0].toString())}
            </p>
          </a>

          <a className={styles.card}>
            <h2>Current reward</h2>
            <p>
              {stakeInfo && ethers.utils.formatEther(stakeInfo[1].toString())}
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
