import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category, CATEGORIES } from '../constants/categories';

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {/* "Tümü" seçeneği */}
        <Chip
          mode={selectedCategoryId === null ? 'flat' : 'outlined'}
          selected={selectedCategoryId === null}
          style={[
            styles.chip,
            selectedCategoryId === null && {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={() => onSelectCategory(null)}
          icon={() => (
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={18}
              color={selectedCategoryId === null ? 'white' : '#757575'}
            />
          )}
          textStyle={{
            color: selectedCategoryId === null ? 'white' : '#757575',
          }}
        >
          Tümü
        </Chip>
        
        {/* Kategori listesi */}
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            mode={selectedCategoryId === category.id ? 'flat' : 'outlined'}
            selected={selectedCategoryId === category.id}
            style={[
              styles.chip,
              selectedCategoryId === category.id && {
                backgroundColor: category.color || theme.colors.primary,
              },
            ]}
            onPress={() => onSelectCategory(category.id)}
            icon={() => (
              <MaterialCommunityIcons
                name={category.icon}
                size={18}
                color={selectedCategoryId === category.id ? 'white' : '#757575'}
              />
            )}
            textStyle={{
              color: selectedCategoryId === category.id ? 'white' : '#757575',
            }}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chipContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  chip: {
    marginHorizontal: 4,
    borderRadius: 20,
  },
});

export default CategorySelector;