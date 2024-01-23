import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

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
  const [account, setAccount] = useState<string>('Not Connected');
  const [balance, setBalance] = useState<string>('0');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {}, []);

  const handleLogin = async () => {};

  const handleLogout = async () => {};

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
