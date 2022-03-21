import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    Box, InputAdornment, OutlinedInput,
} from "@material-ui/core";
import { PROFIT_DISTRIBUTION, BASE_TOMB_ADDR } from '../../abis/address'
import ProfitDistributionABI from '../../abis/ProfitDistribution.json'
import ERC20ABI from '../../abis/ERC20ABI.json'

declare let window: any;

interface Props {
    account: any;
}
const Landing: React.FC<Props> = ({ account }) => {

    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(0);
    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [actiontype, setActionType] = useState(1);
    const [lastStakeTime, setLastStakeTime] = useState(0);
    const [depositFee, setDepositFee] = useState(0);

    async function fetchData() {
        const ProFitDistribution = new window.web3.eth.Contract(ProfitDistributionABI, PROFIT_DISTRIBUTION);
        const depositToken = await ProFitDistribution.methods.depositToken().call();
        const depositTokenContract = new window.web3.eth.Contract(ERC20ABI, depositToken);
        const decimals = await depositTokenContract.methods.decimals().call();
        const symbol = await depositTokenContract.methods.symbol().call();
        let _stakedAmount: any = 0, lastStakeTime = 0;
        if (account) {
            const info = await ProFitDistribution.methods.userInfo(account).call();
            _stakedAmount = info.balance / Math.pow(10, decimals);
            lastStakeTime = info.lastStakedTime;
        }
        let balance: any = 0;
        if (account)
            balance = await depositTokenContract.methods.balanceOf(account).call() / Math.pow(10, decimals);
        const _depositFee = await ProFitDistribution.methods.depositFee().call();
        setTokenInfo({ symbol, decimals, balance, address: depositToken });
        balance = balance.toFixed(5) / 1;
        _stakedAmount = _stakedAmount.toFixed(5) / 1;
        setBalance(balance);
        setStakedAmount(_stakedAmount);
        setLastStakeTime(lastStakeTime);
        setDepositFee(_depositFee);
    }
    useEffect(() => {
        fetchData();
    }, [account])

    async function onStake() {
        if (amount === 0) return;
        const ProFitDistribution = new window.web3.eth.Contract(ProfitDistributionABI, PROFIT_DISTRIBUTION);
        try {
            const temp = '0x' + (BigInt(Math.pow(10, 13)) * BigInt(amount * Math.pow(10, 5))).toString(16);
            const depositTokenContract = new window.web3.eth.Contract(ERC20ABI, tokenInfo.address);
            console.log("Stake", temp);
            await depositTokenContract.methods.approve(PROFIT_DISTRIBUTION, temp).send({ from: account });
            await ProFitDistribution.methods.stakeTokens(temp).send({ from: account });

            fetchData()
        }
        catch (error) {
            console.log(error);
        }
    }
    async function onUnstake() {
        if (amount === 0) return;
        const ProFitDistribution = new window.web3.eth.Contract(ProfitDistributionABI, PROFIT_DISTRIBUTION);
        try {
            const temp = '0x' + (BigInt(Math.pow(10, 13)) * BigInt(amount * Math.pow(10, 5))).toString(16);
            await ProFitDistribution.methods.unstakeTokens(temp).send({ from: account });
            fetchData()
        }
        catch (error) {
            console.log(error);
        }
    }
    async function onClaim() {
        const ProFitDistribution = new window.web3.eth.Contract(ProfitDistributionABI, PROFIT_DISTRIBUTION);
        try {
            await ProFitDistribution.methods.collectRewards().send({ from: account });
            fetchData()
        }
        catch (error) {
            console.log(error);
        }
    }
    return (
        <StyledContainer>
            <Box position={'relative'} bgcolor={'#1A1A1A'} color={'white'} height={'100vh'}>
                <Box display={'flex'} justifyContent={'space-between'} fontSize={'21px'}>
                    <Box>Action: {actiontype === 1 ? 'Stake' : 'UnStake'} Fee = {actiontype === 1 ? depositFee / 1000 : Math.max(7 - (Math.floor((Date.now() / 1000 - lastStakeTime) / 1000)), 0)}%</Box>
                    <Box>Balance : {actiontype === 1 ? balance : stakedAmount}</Box>
                </Box>
                <CustomInput className="amountinput" type="number" value={amount}
                    endAdornment={
                        <InputAdornment position="start">
                            <Box
                                style={{ cursor: "pointer", background: "rgb(253, 136, 19)" }}
                                color={"white"}
                                padding={"0px 10px"}
                                borderRadius={"10px"}
                                fontSize={"30px"}
                                onClick={() => { setAmount(actiontype === 1 ? balance : stakedAmount) }}
                            >
                                MAX
                            </Box>
                        </InputAdornment>
                    }
                    onKeyPress={(event) => {
                        if ((event?.key === '-' || event?.key === '+')) {
                            event.preventDefault();
                        }
                    }}
                    onChange={(event: any) => {
                        if (event.target.value < 0 || event.target.value > (actiontype === 1 ? balance : stakedAmount))
                            return;
                        setAmount(event.target.value);
                    }} />
                <Box display={'flex'} justifyContent={'space-between'} mt={'20px'}>
                    <Box>
                        {actiontype === 2 ?
                            <SecondaryButton onClick={() => setActionType(1)}>
                                Stake
                            </SecondaryButton> : ''}
                        {actiontype === 1 ?
                            <SecondaryButton onClick={() => setActionType(2)}>
                                UnStake
                            </SecondaryButton> : ''}
                    </Box>
                    <Box display={'flex'}>
                        <PrimaryButton onClick={() => onClaim()}>
                            Claim
                        </PrimaryButton>
                        <Box mr={'20px'} />

                        {actiontype === 1 ?
                            <PrimaryButton onClick={() => onStake()}>
                                Confirm
                            </PrimaryButton> : ''}

                        {actiontype === 2 ?
                            <PrimaryButton onClick={() => onUnstake()}>
                                Confirm
                            </PrimaryButton> : ''
                        }
                    </Box>
                </Box>
            </Box>

        </StyledContainer >
    );
};
const StyledContainer = styled(Box)`
    >div{
        padding : calc(100vw / 1280 * 40) calc(100vw / 1280 * 60);
    }
`;
const CustomInput = styled(OutlinedInput)`
    font-size: 40px !important;
    width: 100%;
    margin-top: 10px;
    border-radius: 10px!important;
    border : 1px solid rgb(253, 136, 19);
    color : white!important;
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
`

const PrimaryButton = styled.button`
    background-color : #2D9BF0;
    border : none;
    outline : none;
    padding : calc(100vw / 1280 * 10) calc(100vw / 1280 * 30);
    font-size : calc(100vw / 1280 * 16);
    border-radius : 3px;
    color : white;
`;

const SecondaryButton = styled.button`
    background-color : white;
    border : 1px solid rgb(65, 75, 178);
    outline : none;
    padding : calc(100vw / 1280 * 10) calc(100vw / 1280 * 30);
    border-radius : 3px;
    font-size : calc(100vw / 1280 * 16);
    color : rgb(65, 75, 178);
`;

export default Landing;
