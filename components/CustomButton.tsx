
import { CustomButtonProps } from '@/type';
import cn from 'clsx';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title = "click me",
  style,
  textStyle,
  leftIcon,
  isLoading = false
}) => {
  return (
    <TouchableOpacity className={cn('custom-btn', style)} onPress={onPress}>
      {leftIcon}
      <View className="flex-center flex-row">
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ): (
          <Text className={cn('text-white-100 pargraph-semibold', textStyle)}>
            {title}
          </Text>
        )}
      </View>
    
          </TouchableOpacity>
  );
};

export default CustomButton;