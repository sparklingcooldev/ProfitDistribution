import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Box } from "@material-ui/core";
import Web3 from "web3";
import { Link } from "react-router-dom";
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'Open Sans',
        padding: '50px 0px',
        width: '100%',
        maxWidth: '900px'
    },
};

declare let window: any;

interface TopbarProps {
    account: string;
    setAccount: any;
}

const Topbar: React.FC<TopbarProps> = ({ account, setAccount }) => {
    let ellipsis = account
        ? account.slice(0, 4) +
        "..." +
        account.substring(account.length - 4, account.length)
        : "Connect Wallet";

    const [modalopen, setModalOpen] = useState(false);
    const onConnect = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.enable();
                const accounts = await window.web3.eth.getAccounts();
                setAccount(accounts[0]);
            } catch (error) {
                console.log(error);
            }
        }
    };

    useEffect(() => {
        window.ethereum.on("accountsChanged", function (accounts: any) {
            // Time to reload your interface with accounts[0]!
            onConnect();
        });
        onConnect();
    }, []);

    return (
        <StyledContainer>
            <Modal
                isOpen={modalopen}
                onRequestClose={() => setModalOpen(false)}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <Box display={'flex'} alignItems={'center'} flexDirection={'column'}>
                    <Box fontSize={'36px'} textAlign={'center'} fontWeight={'bold'}>Metamask Interface</Box>
                    <Box fontSize={'14px'} textAlign={'center'} fontWeight={'bold'} mt={'30px'} maxWidth={'600px'}>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</Box>
                    <Box mt={'60px'}>
                        <ConnetWallet onClick={() => { onConnect(); setModalOpen(false) }}>
                            Connect Wallet
                        </ConnetWallet>
                    </Box>
                </Box>
            </Modal>
            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Box display={'flex'} alignItems={'center'} style={{ cursor: 'pointer' }}>

                    <Box fontSize={'calc(100vw / 1280 * 24)'} fontWeight={'bold'}>
                        Profit Distribution.
                    </Box>
                </Box>
                <Menus fontSize={'calc(100vw / 1280 * 16)'}>

                    <ConnetWallet onClick={() => !account && setModalOpen(true)}>
                        {ellipsis}
                    </ConnetWallet>
                </Menus>
            </Box>
        </StyledContainer>
    );
};

const StyledContainer = styled(Box)`
    background-color : #1A1A1A;
    padding : calc(100vw / 1280 * 40) calc(100vw / 1280 * 60);
    color : white;
`;

const ConnetWallet = styled.button`
    background-color : #2D9BF0;
    border : none;
    outline : none;
    padding : 13px 30px;
    border-radius : 3px;
    color : white;
`;

const Menus = styled(Box)`
    display : flex;
    justify-content : space-between;
    align-items : center;
    >div{
        margin-right : calc(100vw / 1280 * 30);
        cursor : pointer;
    }
`;
export default Topbar;
