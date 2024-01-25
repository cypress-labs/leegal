import React, {PropsWithChildren} from 'react';
import {View, Text} from 'react-native';
import tw from 'twrnc';

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

export default Section;
