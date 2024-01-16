import React from 'react';
import {View, Text, ImageBackground} from 'react-native';
import tw from 'twrnc';

const Header = (): React.JSX.Element => {
  return (
    <View>
      <ImageBackground
        source={require('../src/cypress.png')}
        style={tw`h-50 flex justify-center items-center`}>
        <Text style={tw`m-auto text-center text-5xl m-5 font-bold text-white`}>
          Cypress
        </Text>
      </ImageBackground>
    </View>
  );
};

export default Header;
