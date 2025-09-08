import { images } from '@/constants';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View } from 'react-native';


const SearchBar = () => {
    const params = useLocalSearchParams<{ query?: string}>()
    const [query, setQuery] = useState(params.query);

    

    const handleSearch = (text: string) => {
        setQuery(text);

        if(!text) router.setParams({query: undefined});
    };

    const handleSubmit = () => {
    if (query && query.trim()) {
        router.setParams({ query });
    }
}


    return(
        <View className="searchbar">
            <TextInput 
            className="flex-1 p-5" 
            placeholder="search for pizzas, burger ..."
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            placeholderTextColor="#A0A0A0"
            returnKeyType="search"
            />
            <TouchableOpacity 
            className="pr-5" 
            onPress={() => router.setParams({query}) }>
                <Image
                    source={images.search}
                    className="size-6"
                    resizeMode="contain"
                    tintColor="#5D5F6D"
                />
            </TouchableOpacity>
        </View>
    )
}
export default SearchBar