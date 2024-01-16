import React, {useState} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import Header from './components/Header';

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

function App(): React.JSX.Element {
  const [account, setAccount] = useState<string>('Not Connected');
  const [balance, setBalance] = useState<string>('0');

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          <TouchableOpacity
            style={tw`bg-blue-500 text-white font-bold py-2 px-4 rounded`}
            onPress={() => {
              console.log('Login Pressed');
            }}>
            <Text>Connect to Wallet</Text>
          </TouchableOpacity>
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
}

export default App;
