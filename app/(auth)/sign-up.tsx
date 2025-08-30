import { router } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const SignUp: React.FC = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Button title="Sign In" onPress={() => router.push("/sign-in")} /> 
    </View>
  );
};

export default SignUp;
