import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import {SafeAreaView, Text, View, TextInput} from 'react-native';

import {web3auth, web3AuthLoginOptions} from './helpers/Web3AuthProvider';
import TransactionBuilder from './helpers/TransactionBuilder';
import {VECHAIN_NODE_URL_DEVNET} from './constants/Constants';

import {ethers} from 'ethers';
import * as thor from '@vechain/web3-providers-connex';
import {Framework} from '@vechain/connex-framework';
import {Driver, SimpleWallet} from '@vechain/connex-driver';
import {SimpleNet} from './custom_modules/@vechain/dist/simple-net';

import Header from './components/Header';
import Section from './components/Section';
import Button from './components/Button';

import {CONTRACT_ADDRESS, ABI} from './src/Greeting.sol';

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [account, setAccount] = useState<string>('');
  const [wallet, setWallet] = useState<SimpleWallet>(null);
  const [addresses, setAddresses] = useState<any>([]);
  const [balance, setBalance] = useState<any>('0');
  const [input, setInput] = useState<string>('');
  const [txs, setTxs] = useState<string[]>([]);

  const [msg, setMsg] = useState('Click Get Message');
  const [provider, setProvider] =
    useState<ethers.providers.JsonRpcProvider>(null);

  const initEthers = async () => {
    const net = new SimpleNet(VECHAIN_NODE_URL_DEVNET);
    const driver = await Driver.connect(net);
    const connex = new Framework(driver);
    const ethersProvider = thor.ethers.modifyProvider(
      new ethers.providers.Web3Provider(
        new thor.Provider({
          connex: connex,
          net: net,
        }),
      ),
    );
    setProvider(ethersProvider);
  };

  const getBalance = async (
    ethersProvider: ethers.providers.JsonRpcProvider,
    address: string,
  ) => {
    const balance = await ethersProvider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));
  };

  const handelLogin = async ethersProvider => {
    await web3auth.login(web3AuthLoginOptions).catch((err: any) => {
      console.log(err);
    });
    let newWallet = new SimpleWallet();
    newWallet.import(web3auth.privKey);
    setWallet(newWallet);
    setAddresses(newWallet.list);
    setIsLoggedIn(true);
    setAccount(web3auth.userInfo().email || 'Not Connected');
    getBalance(ethersProvider, newWallet.list[0].address);
  };

  const handleLogout = async () => {
    await web3auth.logout();
    setIsLoggedIn(false);
    setAccount('Not Connected');
    setAddresses([]);
  };

  useEffect(() => {
    web3auth.init();
    initEthers();
  }, []);

  const getContractMsg = ethersProvider => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, ethersProvider);
    contract.getGreeting().then((res: string) => {
      setMsg(res);
    });
  };

  const setContractMsg = async (
    ethersProvider: ethers.providers.JsonRpcProvider,
  ) => {
    const raw = await TransactionBuilder(
      CONTRACT_ADDRESS,
      ABI,
      'setGreeting',
      [input || 'Hello World'],
      wallet,
      ethersProvider,
    );
    //console.log(raw);
    ethersProvider.send('eth_sendRawTransaction', [raw]).then((res: any) => {
      setTxs([...txs, res]);
    });
  };

  return (
    <SafeAreaView style={tw`bg-white`}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          {isLoggedIn ? (
            <Button color="red" onPress={() => handleLogout()}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button color="blue" onPress={() => handelLogin(provider)}>
              Connect Wallet
            </Button>
          )}
        </Section>
        <Section title="Account Details">
          <Text style={tw`text-gray-500`}>Account: {account}</Text>
          {addresses.map((item, index) => (
            <Text key={index} style={tw`text-gray-500`}>
              Wallet {index + 1}: {item.address}{' '}
            </Text>
          ))}
        </Section>
        <Section title="Chain Details">
          <Text style={tw`text-gray-500`}>$VET Balance: {balance} </Text>
          <Text style={tw`text-gray-500`}>$FRT Balance: Not Implemented</Text>
        </Section>
        <Section title="Contract Calls">
          <Text style={tw`text-red-500 font-bold text-lg`}>
            Greeting: {msg}
          </Text>
          <TextInput
            style={tw`border border-gray-400 rounded p-2 mt-2`}
            value={input}
            onChange={e => setInput(e.nativeEvent.text)}
          />
          <Button
            color="green"
            onPress={() => {
              setContractMsg(provider);
            }}>
            Set Message
          </Button>
          <Button
            color="blue"
            onPress={() => {
              getContractMsg(provider);
            }}>
            Get Message
          </Button>
        </Section>
        <Section title="Recent Transactions">
          {txs.length > 0 ? (
            txs.slice(txs.length - 4, txs.length).map((item, index) => (
              <Text key={index} style={tw`text-gray-500`}>
                {item}
              </Text>
            ))
          ) : (
            <Text style={tw`text-gray-500`}>No Transactions</Text>
          )}
        </Section>
      </View>
    </SafeAreaView>
  );
};

export default App;
