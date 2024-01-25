import React from 'react';
import tw from 'twrnc';
import {TouchableOpacity, Text} from 'react-native';

const Button = ({children, onPress, color}: any): React.JSX.Element => {
  return (
    <TouchableOpacity
      style={tw`bg-${color}-400 text-white font-bold py-2 px-4 mt-2 rounded`}
      onPress={onPress}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;
