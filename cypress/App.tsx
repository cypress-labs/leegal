import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

import EncryptedStorage from 'react-native-encrypted-storage';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import Web3Auth, {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

import {ethers} from 'ethers';
import * as thor from '@vechain/web3-providers-connex';
import {Framework} from '@vechain/connex-framework';
import {Driver, SimpleWallet} from '@vechain/connex-driver';
import {SimpleNet} from './custom_modules/@vechain/dist/simple-net';

import Header from './components/Header';

// Smart contract details
const NODE_URL = 'https://sync-testnet.vechain.org';
//import CONTRACT_ABI from './src/cypress_abi.json';

// Web3Auth details
const WEB3AUTH_CLIENTID =
  'BCTSBrn61jL_KXD6ZJURT65r8XBr9FNGvMjOrFqkHBNnq-z00Qa5Q1jO1B-1qUzXEo_AlezGqL2zmcMJbslMSEo';
const scheme = 'app.cypresslabs.ios';
const redirectUrl = `${scheme}://auth`;
const web3AuthLoginOptions = {
  loginProvider: LOGIN_PROVIDER.GOOGLE,
  redirectUrl: redirectUrl,
};

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const Section = ({children, title}: SectionProps): React.JSX.Element => {
  return (
    <View style={tw`mt-3 px-2 flex flex-col`}>
      <Text style={tw`text-2xl font-bold dark:text-white`}>{title}</Text>
      {children}
    </View>
  );
};

const Button = ({children, onPress, color}: any): React.JSX.Element => {
  return (
    <TouchableOpacity
      style={tw`bg-${color}-400 text-white font-bold py-2 px-4 mt-2 rounded`}
      onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};

const App = (): React.JSX.Element => {
  const [wallet, setWallet] = useState<SimpleWallet>(new SimpleWallet());
  const [wallets, setWallets] = useState<Key[]>([]);
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState<string>('Not Connected');
  const [balance, setBalance] = useState<string>('0 VET');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [contract, setContract] = useState<any>();

  const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
    clientId: WEB3AUTH_CLIENTID, // Get your Client ID from the Web3Auth Dashboard
    network: 'sapphire_devnet',
  });

  useEffect(() => {
    web3auth.init();
  }, [web3auth]);

  const updateBalance = () => {
    if (provider) {
      provider.getBalance(wallets[0].address).then((balance: any) => {
        setBalance(ethers.utils.formatEther(balance) + ' VET');
      });
    }
  };

  const initEthers = () => {
    const CONTRACT_ADDRESS = '0x0000000000000000000000000000456e65726779';
    const ABI = [
      {
        name: 'totalSupply',
        inputs: [],
        outputs: [{internalType: 'uint256', name: 'vtho', type: 'uint256'}],
        stateMutability: 'view',
        type: 'function',
      },
    ];
    Driver.connect(new SimpleNet('https://testnet.vecha.in/')).then(
      async driver => {
        const connexObj = new Framework(driver);
        const ethProvider = thor.ethers.modifyProvider(
          new ethers.providers.Web3Provider(
            new thor.Provider({connex: connexObj}),
          ),
        );
        setProvider(ethProvider);
        setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, ethProvider));
      },
    );
  };

  const handleLogin = async () => {
    await web3auth.login(web3AuthLoginOptions);
    setIsLoggedIn(true);
    setAccount(web3auth.userInfo().email || 'Not Connected');
    wallet.import(web3auth.privKey);
    setWallets(wallet.list);
    initEthers();
  };

  const handleLogout = async () => {
    await web3auth.logout();
    setIsLoggedIn(false);
    setAccount('Not Connected');
    setWallets([]);
    setBalance('0 VET');
  };

  const handleContract = async () => {
    if (!provider || !contract) {
      return;
    }
    const totalSupply = await contract.totalSupply();
    console.log(totalSupply);
  };

  return (
    <SafeAreaView style={tw`bg-white`}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          <Button
            onPress={() => {
              wallet.import(
                '1b5a3a8df6791179f578bf1328d1f042a4cd933d995878bf79519327298916da',
              );
              setWallets(wallet.list);
              setIsLoggedIn(true);
              setAccount('Manual Wallet');
            }}
            color="orange">
            Manual Wallet
          </Button>
          {isLoggedIn ? (
            <Button
              onPress={() => {
                handleLogout();
              }}
              color="red">
              Disconnect Wallet
            </Button>
          ) : (
            <Button
              onPress={() => {
                handleLogin();
              }}
              color="blue">
              Connect to Wallet
            </Button>
          )}
        </Section>
        <Section title="Account Details">
          <Text style={tw`text-gray-500`}>Web3Auth Account: {account} </Text>
          {wallets.map((item, index) => (
            <Text key={index} style={tw`text-gray-500`}>
              Wallet {index + 1}: {item.address}{' '}
            </Text>
          ))}
        </Section>
        <Section title="$FRT & $VET Balance">
          <Text style={tw`text-gray-500`}>$VET Balance: {balance}</Text>
          <Text style={tw`text-gray-500`}>$FRT Balance: Not Implemented</Text>
        </Section>
        <Section title="Garden Details">
          <Text>Debug details of the garden</Text>
          <Button
            onPress={() => {
              initEthers();
            }}
            color="green">
            Manual Init Ethers
          </Button>
          <Button
            onPress={() => {
              updateBalance();
            }}
            color="violet">
            Update Balance
          </Button>
          <Button
            onPress={() => {
              handleContract();
            }}
            color="yellow">
            Call Contract
          </Button>
        </Section>
      </View>
    </SafeAreaView>
  );
};

export default App;
