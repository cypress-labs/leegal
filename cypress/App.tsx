import React, {useState, useEffect} from 'react';
import tw from 'twrnc';
import type {PropsWithChildren} from 'react';
import {SafeAreaView, Text, View, TouchableOpacity} from 'react-native';

import {ethers} from 'ethers';
import * as thor from '@vechain/web3-providers-connex';
import {Framework} from '@vechain/connex-framework';
import {Driver} from '@vechain/connex-driver';
import {SimpleNet} from './custom_modules/@vechain/dist/simple-net';

import Header from './components/Header';
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

const App = (): React.JSX.Element => {
  const [balance, setBalance] = useState('0');
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  Driver.connect(new SimpleNet('https://sync-testnet.vechain.org/')).then(
    driver => {
      const connexObj = new Framework(driver);
      const provider = thor.ethers.modifyProvider(
        new ethers.providers.Web3Provider(
          new thor.Provider({connex: connexObj}),
        ),
      );
      setProvider(provider);
    },
  );

  useEffect(() => {
    updateVthoSupply();
  }, [provider]);

  const updateVthoSupply = () => {
    if (!provider) return;
  };

  return (
    <SafeAreaView style={tw`bg-white`}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          <Text>VETHO Balance: {balance}</Text>
        </Section>
      </View>
    </SafeAreaView>
  );
};

export default App;
