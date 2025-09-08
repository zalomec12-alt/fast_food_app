import { appwriteConfig } from '@/lib/appwrite';
import { MenuItem } from '@/type';
import React from 'react';
import { Image, Platform, Text, TouchableOpacity } from 'react-native';

const buildImageUrl = (image_url?: string, projectId?: string): string | undefined =>
  image_url && projectId && !image_url.includes('project=')
    ? `${image_url}${image_url.includes('?') ? '&' : '?'}project=${projectId}`
    : image_url;

const MenuCard = ({ item: { image_url, name, price } }: { item: MenuItem }) => {
  const imageUrl = buildImageUrl(image_url, appwriteConfig.projectId);

  return (
    <TouchableOpacity className="menu-card" style={Platform.OS === 'android' ? {elevation: 10, shadowColor: '#878787'}: {}}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: 128, height: 128, position: 'absolute', top: -40 }}
          resizeMode="contain"
        />
      )}
      <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
      <Text className="body-regular text-gray-200 mb-4">From ${price}</Text>
      <TouchableOpacity onPress={() => {}}>
        <Text className="paragraph-bold text-primary">Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
