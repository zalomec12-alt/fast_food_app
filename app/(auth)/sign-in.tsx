import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { signIn } from '@/lib/appwrite';
import * as sentry from '@sentry/react-native';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignIn: React.FC = () => {
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit: () => Promise<void> = async () => {
    const { email, password } = form;
    if (!email || !password) {
     return Alert.alert("Error", "Please enter valid email & password");
    }

    setIsSubmiting(true);

    try {
      await signIn({email,password });

      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      sentry.captureEvent(error);
    } finally {
      setIsSubmiting(false);
    }
  }; // <-- aquí cierro la función

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        label="Email"
        keyboardType="email-address"
      />

      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        label="Password"
        secureTextEntry={true}
      />

      <CustomButton
        title= "Sign In"
        onPress={submit}
        isLoading={isSubmitting}
      />

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Dont have an account?
        </Text>
        <Link href="/sign-up" className="base-bold text-primary">
          Sign up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
