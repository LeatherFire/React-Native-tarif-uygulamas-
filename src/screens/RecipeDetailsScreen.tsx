import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, Alert, Share, Platform } from 'react-native';
import { Text, Divider, IconButton, Chip, Button, Menu, FAB } from 'react-native-paper';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useRecipeStore } from '../store/recipeStore';
import { useShoppingListStore } from '../store/shoppingListStore';
import { CATEGORIES } from '../constants/categories';
import { DIET_TYPES, MEAL_TYPES } from '../constants/nutrition';

type RecipeDetailsRouteProp = RouteProp<RootStackParamList, 'RecipeDetails'>;
type RecipeDetailsNavigationProp = StackNavigationProp<RootStackParamList>;

const RecipeDetailsScreen = () => {
  const route = useRoute<RecipeDetailsRouteProp>();
  const navigation = useNavigation<RecipeDetailsNavigationProp>();
  const { recipeId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const { recipes, loadAllRecipes, deleteRecipe } = useRecipeStore();
  const { addItemsFromRecipe } = useShoppingListStore();
  const recipe = recipes.find(r => r.id === recipeId);
  
  useEffect(() => {
    const loadRecipe = async () => {
      setIsLoading(true);
      try {
        await loadAllRecipes();
        console.log('Yüklenen tarif ID:', recipeId);
        console.log('Mevcut tarifler:', recipes.map(r => ({ id: r.id, title: r.title })));
        setIsLoading(false);
      } catch (err) {
        console.error('Tarif yükleme hatası:', err);
        setError('Tarif yüklenirken bir hata oluştu.');
        setIsLoading(false);
      }
    };
    
    loadRecipe();
  }, [recipeId]);
  
  const handleEdit = () => {
    setMenuVisible(false);
    
    if (recipe) {
      navigation.navigate('CreateRecipe', { 
        editMode: true,
        recipe: recipe
      });
    }
  };
  
  const handleDelete = () => {
    setMenuVisible(false);
    
    Alert.alert(
      'Tarifi Sil',
      'Bu tarifi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipeId);
              Alert.alert('Başarılı', 'Tarif başarıyla silindi.');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Hata', 'Tarif silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };
  
  // Tarifi paylaşma işlevi
  const handleShareRecipe = async () => {
    setMenuVisible(false);
    
    if (!recipe) return;
    
    // Kategori adını bul
    const category = recipe.categoryId 
      ? CATEGORIES.find(cat => cat.id === recipe.categoryId)?.name || 'Diğer'
      : 'Diğer';
    
    // Paylaşım metni oluştur
    const shareText = `🍲 ${recipe.title} Tarifi\n\n` +
      `📝 ${recipe.description}\n\n` +
      `🏷️ Kategori: ${category}\n` +
      `⏱️ Hazırlama: ${recipe.prepTime} dk, Pişirme: ${recipe.cookTime} dk\n` +
      `👥 ${recipe.servings} kişilik\n\n` +
      `📋 Malzemeler:\n${recipe.ingredients.map(i => `• ${i}`).join('\n')}\n\n` +
      `👨‍🍳 Hazırlanışı:\n${recipe.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}\n\n` +
      `TarifApp ile paylaşıldı 📱`;
    
    try {
      const result = await Share.share(
        {
          message: shareText,
          title: `${recipe.title} Tarifi`,
        },
        {
          // iOS için diyalog başlığı
          dialogTitle: 'Tarifi Paylaş',
          // Sadece iOS'ta kullanılabilecek UTI tipi
          ...Platform.select({
            ios: {
              subject: `${recipe.title} Tarifi`,
              // URL olsaydı buraya eklenebilirdi
            },
          }),
        }
      );
      
      if (result.action === Share.sharedAction) {
        console.log('Paylaşım başarılı');
      } else if (result.action === Share.dismissedAction) {
        console.log('Paylaşım iptal edildi');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Alert.alert('Hata', 'Tarif paylaşılırken bir sorun oluştu.');
    }
  };
  
  // Malzemeleri alışveriş listesine ekleme
  const handleAddToShoppingList = async () => {
    if (!recipe) return;
    
    try {
      const addedCount = await addItemsFromRecipe(recipe.ingredients, recipe.id);
      
      if (addedCount > 0) {
        Alert.alert(
          'Başarılı',
          `${addedCount} malzeme alışveriş listesine eklendi.`,
          [
            { 
              text: 'Tamam', 
              style: 'default' 
            },
            { 
              text: 'Listeye Git', 
              onPress: () => navigation.navigate('Main', { screen: 'ShoppingList' })
            }
          ]
        );
      } else {
        Alert.alert(
          'Bilgi',
          'Bu tarifin tüm malzemeleri zaten alışveriş listenizde bulunuyor.'
        );
      }
    } catch (err) {
      Alert.alert('Hata', 'Malzemeler alışveriş listesine eklenirken bir sorun oluştu.');
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Tarif yükleniyor...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tarif bulunamadı.</Text>
        <Text>ID: {recipeId}</Text>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => loadAllRecipes()} 
        >
          Yeniden Dene
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Görsel Yok</Text>
          </View>
        )}
        
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.description}>{recipe.description}</Text>
            </View>
            
            <IconButton
              icon="share-variant"
              size={24}
              mode="contained"
              containerColor="#FF6B6B"
              iconColor="white"
              onPress={handleShareRecipe}
              style={styles.shareButton}
            />
          </View>
          
          {/* Kategori gösterimi */}
          {recipe.categoryId && (
            <View style={styles.categoryContainer}>
              {(() => {
                const category = CATEGORIES.find(cat => cat.id === recipe.categoryId);
                if (category) {
                  return (
                    <Chip 
                      icon={() => (
                        <MaterialCommunityIcons 
                          name={category.icon} 
                          size={16} 
                          color={category.color} 
                        />
                      )}
                      style={[styles.categoryChip, { backgroundColor: category.color + '15' }]}
                      textStyle={{ color: category.color }}
                    >
                      {category.name}
                    </Chip>
                  );
                }
                return null;
              })()}
            </View>
          )}
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <IconButton icon="clock-outline" size={20} />
              <Text>Hazırlama: {recipe.prepTime} dk</Text>
            </View>
            <View style={styles.metaItem}>
              <IconButton icon="pot-steam" size={20} />
              <Text>Pişirme: {recipe.cookTime} dk</Text>
            </View>
            <View style={styles.metaItem}>
              <IconButton icon="food-variant" size={20} />
              <Text>Porsiyon: {recipe.servings}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            <Button 
              mode="outlined"
              icon="cart-plus"
              onPress={handleAddToShoppingList}
              style={styles.addToCartButton}
              labelStyle={{ color: '#FF6B6B' }}
            >
              Liste Ekle
            </Button>
          </View>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text>• {ingredient}</Text>
            </View>
          ))}
          
          <Divider style={styles.divider} />
          
          {/* Beslenme bilgilerini gösterme */}
          {recipe.nutritionInfo && (
            <>
              <Text style={styles.sectionTitle}>Besin Değerleri</Text>
              <View style={styles.nutritionContainer}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
                  <Text style={styles.nutritionLabel}>kalori</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}g</Text>
                  <Text style={styles.nutritionLabel}>protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>karbonhidrat</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}g</Text>
                  <Text style={styles.nutritionLabel}>yağ</Text>
                </View>
              </View>
              
              {/* Diyet tipleri */}
              {recipe.dietTypeIds && recipe.dietTypeIds.length > 0 && (
                <View style={styles.dietTypesContainer}>
                  {recipe.dietTypeIds.map(dietId => {
                    const diet = DIET_TYPES.find(d => d.id === dietId);
                    return diet ? (
                      <Chip 
                        key={diet.id}
                        icon={diet.icon}
                        style={styles.dietChip}
                      >
                        {diet.name}
                      </Chip>
                    ) : null;
                  })}
                </View>
              )}
              
              {/* Öğün tipi */}
              {recipe.mealTypeId && (
                <View style={styles.mealTypeContainer}>
                  {(() => {
                    const meal = MEAL_TYPES.find(m => m.id === recipe.mealTypeId);
                    return meal ? (
                      <Chip
                        icon={meal.icon}
                        style={styles.mealChip}
                      >
                        {meal.name}
                      </Chip>
                    ) : null;
                  })()}
                </View>
              )}
              
              <Divider style={styles.divider} />
            </>
          )}
          
          <Text style={styles.sectionTitle}>Hazırlanışı</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Chip mode="outlined" style={styles.stepChip}>{index + 1}</Chip>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Sağ üst köşede menu butonu */}
      <View style={styles.menuContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={handleShareRecipe} title="Paylaş" leadingIcon="share-variant" />
          <Menu.Item onPress={handleEdit} title="Düzenle" leadingIcon="pencil" />
          <Menu.Item onPress={handleDelete} title="Sil" leadingIcon="delete" />
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#FF6B6B',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
  },
  image: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    marginRight: 16,
  },
  shareButton: {
    margin: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  // Kategori stili
  categoryContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    borderRadius: 20,
    height: 32,
    alignSelf: 'flex-start',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addToCartButton: {
    borderColor: '#FF6B6B',
  },
  ingredientItem: {
    paddingVertical: 6,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepChip: {
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  instructionText: {
    flex: 1,
    paddingTop: 4,
  },
  menuContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  // Beslenme bilgileri stilleri
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
  },
  nutritionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  dietTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dietChip: {
    margin: 4,
    backgroundColor: '#f0f0f0',
  },
  mealTypeContainer: {
    marginBottom: 16,
  },
  mealChip: {
    backgroundColor: '#e0f7fa',
  },
});

export default RecipeDetailsScreen;