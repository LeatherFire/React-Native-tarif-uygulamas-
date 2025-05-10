// src/navigation/types.ts
export type RootStackParamList = {
  Main: undefined;
  RecipeDetails: { recipeId: string };
  CreateRecipe: { editMode?: boolean; recipe?: Recipe } | undefined;
  RecipeOptions: undefined;
  NutritionRecipe: undefined;
  IngredientBasedRecipe: undefined;
  QuickRecipe: undefined;
  WorldCuisineRecipe: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Favorites: undefined;
  ShoppingList: undefined;
  Profile: undefined;
};