import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

import Header from './components/Header';

import Web3Auth, {
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from '@web3auth/react-native-sdk';
import * as WebBrowser from '@toruslabs/react-native-web-browser';
import EncryptedStorage from 'react-native-encrypted-storage';

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

const SdkInitParams = {
  clientId:
    'BCTSBrn61jL_KXD6ZJURT65r8XBr9FNGvMjOrFqkHBNnq-z00Qa5Q1jO1B-1qUzXEo_AlezGqL2zmcMJbslMSEo',
  network: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET, // or other networks
};

const scheme = 'app.cypresslabs.ios';
const redirectUrl = `${scheme}://auth`;

const App = (): React.JSX.Element => {
  const [account, setAccount] = useState<string>('Not Connected');
  const [balance, setBalance] = useState<string>('0');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, SdkInitParams);

  useEffect(() => {
    web3auth.init();
  }, [web3auth]);

  const handleLogin = async () => {
    web3auth
      .login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
        redirectUrl,
      })
      .then(res => {
        console.log(web3auth.userInfo());
        setIsLoggedIn(true);
        setAccount(web3auth.userInfo().email || 'Not Connected');
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleLogout = async () => {
    web3auth.logout();
    setIsLoggedIn(false);
    setAccount('Not Connected');
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
          <Text style={tw`text-gray-500`}>Account: {account}</Text>
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
