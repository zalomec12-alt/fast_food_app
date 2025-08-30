
import { router } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const SignIn: React.FC = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Button title="Sign Up"onPress={() => router.push("/sign-up")} /> 
     </View>
  );
};

export default SignIn;
