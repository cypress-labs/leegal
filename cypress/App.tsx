import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

import EncryptedStorage from 'react-native-encrypted-storage';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import Web3Auth, {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

import {thorify} from 'thorify';
const Web3 = require('web3');

//import ethers from '@vechain/ethers';
//import Connex from '@vechain/connex';

import Header from './components/Header';

const WEB3AUTH_CLIENTID =
  'BCTSBrn61jL_KXD6ZJURT65r8XBr9FNGvMjOrFqkHBNnq-z00Qa5Q1jO1B-1qUzXEo_AlezGqL2zmcMJbslMSEo';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  return (
    <View style={tw`mt-3 px-2`}>
      <Text style={tw`text-2xl font-bold dark:text-white`}>{title}</Text>
      <Text style={tw`mt-1 text-base font-medium dark:text-white`}>
        {children}
      </Text>
    </View>
  );
}

const scheme = 'app.cypresslabs.ios';
const redirectUrl = `${scheme}://auth`;

const App = (): React.JSX.Element => {
  const [privateKey, setPrivateKey] = useState<string>('Not Connected');
  const [account, setAccount] = useState<string>('Not Connected');
  const [balance, setBalance] = useState<string>('0');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  //const web3auth = new Web3Auth(EncryptedStorage, SdkInitOptions);
  //

  const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
    clientId: WEB3AUTH_CLIENTID, // Get your Client ID from the Web3Auth Dashboard
    network: 'sapphire_devnet',
  });

  const web3AuthLoginOptions = {
    loginProvider: LOGIN_PROVIDER.GOOGLE,
    redirectUrl: redirectUrl,
  };

  useEffect(() => {
    web3auth.init();
  }, [web3auth]);

  const handleLogin = async () => {
    web3auth
      .login(web3AuthLoginOptions)
      .then(() => {
        //console.log(web3auth.userInfo());
        setIsLoggedIn(true);
        setAccount(web3auth.userInfo().email || 'Not Connected');
        setPrivateKey(web3auth.privKey || '');
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleLogout = async () => {
    await web3auth.logout();
    setIsLoggedIn(false);
    setAccount('Not Connected');
    setPrivateKey('Not Connected');
  };

  return (
    <SafeAreaView style={tw`bg-white`}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          {isLoggedIn ? (
            <TouchableOpacity
              style={tw`bg-red-500 font-bold py-2 px-4 rounded`}
              onPress={() => {
                handleLogout();
              }}>
              <Text style={tw`text-white`}>Disconnect Wallet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={tw`bg-blue-400 text-white font-bold py-2 px-4 rounded`}
              onPress={() => {
                handleLogin();
              }}>
              <Text>Connect to Wallet</Text>
            </TouchableOpacity>
          )}
        </Section>
        <Section title="Account Details">
          <Text style={tw`text-gray-500`}>
            Account: {account}
            {'\n'}
            PKey: {privateKey}
          </Text>
        </Section>
        <Section title="$FRT Balance">
          <Text style={tw`text-gray-500`}>Balance: {balance}</Text>
        </Section>
        <Section title="Garden Details">Debug details of the garden</Section>
      </View>
    </SafeAreaView>
  );
};

export default App;
