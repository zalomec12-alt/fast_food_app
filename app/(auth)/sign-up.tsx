import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import { createUser } from '@/lib/appwrite';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignUp: React.FC = () => {
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [form, setForm] = useState({ name:'', email: '', password: '' });

  const submit: () => Promise<void> = async () => {
    const {name, email, password} = form; 

    if (!name || !email || !password) {
      return Alert.alert("Error", "Please enter valid email & password");
    }

    setIsSubmiting(true)
        
    try {
      await createUser({ email, password, name });
 
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmiting(false);
    }
  }; // <-- aquí cierro la función

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">

      <CustomInput
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
        label="full name"
      />

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
        title="Sign Up"
        onPress={submit}
        isLoading={isSubmitting}
      />

      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
