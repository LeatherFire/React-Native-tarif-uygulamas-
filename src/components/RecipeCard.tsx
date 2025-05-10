import React, { memo } from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, IconButton, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { Recipe } from '../constants/mockData';
import { CATEGORIES } from '../constants/categories';
import { useRecipeStore } from '../store/recipeStore';

type RecipeCardNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFavorite }) => {
  const navigation = useNavigation<RecipeCardNavigationProp>();
  // Favoriler listesini store'dan alın
  const { favoriteIds } = useRecipeStore();
  
  // Tarifin favorilerde olup olmadığını kontrol edin
  const isFavorite = favoriteIds.includes(recipe.id);

  const handlePress = () => {
    console.log('Tarif detayına yönlendiriliyor, ID:', recipe.id);
    navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  };

  // Kategori bilgisini bul
  const category = recipe.categoryId 
    ? CATEGORIES.find(cat => cat.id === recipe.categoryId) 
    : null;

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: recipe.imageUrl }} style={styles.cardImage} />
        <View style={styles.favoriteButton}>
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            iconColor={isFavorite ? '#FF6B6B' : '#757575'}
            size={24}
            onPress={() => onToggleFavorite(recipe.id)}
          />
        </View>
        
        {/* Kategori etiketi */}
        {category && (
          <View style={styles.categoryBadge}>
            <Chip 
              style={[styles.categoryChip, { backgroundColor: category.color + '20' /* %20 opaklık */ }]}
              textStyle={{ color: category.color, fontWeight: 'bold' }}
            >
              <MaterialCommunityIcons name={category.icon} size={14} color={category.color} />{' '}
              {category.name}
            </Chip>
          </View>
        )}
        
        <Card.Content>
          <Title style={styles.title}>{recipe.title}</Title>
          <Paragraph style={styles.description}>{recipe.description}</Paragraph>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <IconButton icon="clock-outline" size={16} />
              <Paragraph>{recipe.prepTime + recipe.cookTime} dk</Paragraph>
            </View>
            <View style={styles.metaItem}>
              <IconButton icon="food-variant" size={16} />
              <Paragraph>{recipe.servings} kişilik</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardImage: {
    height: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    margin: 8,
  },
  categoryBadge: {
    position: 'absolute',
    top: 140, // Görselin alt kısmına yakın
    left: 10,
  },
  categoryChip: {
    height: 30,
    borderRadius: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    marginBottom: 8,
    color: '#757575',
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
});

// memo ile sarmalayarak gereksiz yeniden renderları önlüyoruz
export default memo(RecipeCard, (prevProps, nextProps) => {
  // Sadece gerekli özellikler değiştiğinde yeniden render
  return (
    prevProps.recipe.id === nextProps.recipe.id &&
    prevProps.recipe.isFavorite === nextProps.recipe.isFavorite &&
    prevProps.recipe.title === nextProps.recipe.title &&
    prevProps.recipe.description === nextProps.recipe.description &&
    prevProps.recipe.imageUrl === nextProps.recipe.imageUrl &&
    prevProps.recipe.categoryId === nextProps.recipe.categoryId
  );
});