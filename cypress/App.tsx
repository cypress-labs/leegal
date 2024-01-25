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
  const [msg, setMsg] = useState('0');
  const [provider, setProvider] = useState<any>(null);

  const initEthers = () => {
    Driver.connect(new SimpleNet('https://sync-testnet.vechain.org/')).then(
      driver => {
        const connexObj = new Framework(driver);
        const ethersProvider = thor.ethers.modifyProvider(
          new ethers.providers.Web3Provider(
            new thor.Provider({connex: connexObj}),
          ),
        );
        setProvider(ethersProvider);
        updateVthoSupply(ethersProvider);
      },
    );
  };

  useEffect(() => {
    initEthers();
  }, []);

  const updateVthoSupply = ethersProvider => {
    const CONTRACT_ADDRESS = '0x0B12235c85d13495372E763c98763105b40337c6';
    const ABI = [
      {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [],
        name: 'getGreeting',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'getSender',
        outputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'string',
            name: '_newGreeting',
            type: 'string',
          },
        ],
        name: 'setGreeting',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, ethersProvider);
    contract.getGreeting().then((res: string) => {
      setMsg(res);
    });
  };

  return (
    <SafeAreaView style={tw`bg-white`}>
      <Header />
      <View style={tw`bg-white`}>
        <Section title="Login via Web3Auth">
          <Text>Greeting: {msg}</Text>
        </Section>
      </View>
    </SafeAreaView>
  );
};

export default App;
