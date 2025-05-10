// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import BottomTabNavigator from './BottomTabNavigator';
import RecipeDetailsScreen from '../screens/RecipeDetailsScreen';
import CreateRecipeScreen from '../screens/CreateRecipeScreen';
import RecipeOptionsScreen from '../screens/RecipeOptionsScreen';
import NutritionRecipeScreen from '../screens/NutritionRecipeScreen';
import IngredientBasedRecipeScreen from '../screens/IngredientBasedRecipeScreen';
import QuickRecipeScreen from '../screens/QuickRecipeScreen';
import WorldCuisineRecipeScreen from '../screens/WorldCuisineRecipeScreen';


const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen
          name="RecipeDetails"
          component={RecipeDetailsScreen}
          options={{
            headerShown: true,
            title: 'Tarif Detayları',
          }}
        />
        <Stack.Screen
          name="CreateRecipe"
          component={CreateRecipeScreen}
          options={{
            headerShown: true,
            title: 'Yeni Tarif Oluştur',
          }}
        />
        <Stack.Screen
          name="RecipeOptions"
          component={RecipeOptionsScreen}
          options={{
            headerShown: true,
            title: 'Tarif Seçenekleri',
          }}
        />
        {/* Bu ekranlar henüz oluşturulmadı, sonraki adımlarda eklenecek */}
        <Stack.Screen
          name="NutritionRecipe"
          component={NutritionRecipeScreen}
          options={{
            headerShown: true,
            title: 'Beslenme Odaklı Tarif',
          }}
        />
        <Stack.Screen
          name="IngredientBasedRecipe"
          component={IngredientBasedRecipeScreen}
          options={{
            headerShown: true,
            title: 'Eldeki Malzemeler',
          }}
        />
        <Stack.Screen
          name="QuickRecipe"
          component={QuickRecipeScreen}
          options={{
            headerShown: true,
            title: 'Hızlı Tarif',
          }}
        />
        <Stack.Screen
          name="WorldCuisineRecipe"
          component={WorldCuisineRecipeScreen} // CreateRecipeScreen yerine WorldCuisineRecipeScreen kullanın
          options={{
            headerShown: true,
            title: 'Dünya Mutfakları',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;