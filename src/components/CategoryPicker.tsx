import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, Dialog, Portal, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category, CATEGORIES } from '../constants/categories';

interface CategoryPickerProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  
  // Seçili kategoriyi bul
  const selectedCategory = CATEGORIES.find(
    (category) => category.id === selectedCategoryId
  );

  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);

  const handleCategorySelect = (categoryId: string) => {
    onSelectCategory(categoryId);
    hideDialog();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kategori</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={showDialog}
        activeOpacity={0.7}
      >
        {selectedCategory ? (
          <View style={styles.selectedCategoryContainer}>
            <View style={[styles.iconContainer, { backgroundColor: selectedCategory.color + '20' }]}>
              <MaterialCommunityIcons
                name={selectedCategory.icon}
                size={24}
                color={selectedCategory.color}
              />
            </View>
            <Text style={styles.selectedCategoryText}>
              {selectedCategory.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Kategori Seçin</Text>
        )}
        <MaterialCommunityIcons name="chevron-down" size={24} color="#757575" />
      </TouchableOpacity>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={hideDialog}
          style={styles.dialog}
        >
          <Dialog.Title>Kategori Seçin</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.categoryList}>
              <RadioButton.Group
                onValueChange={handleCategorySelect}
                value={selectedCategoryId}
              >
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: category.color + '20' },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={24}
                          color={category.color}
                        />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <RadioButton value={category.id} />
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    fontSize: 16,
  },
  placeholderText: {
    color: '#757575',
    fontSize: 16,
  },
  dialog: {
    maxHeight: '80%',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
  },
});

export default CategoryPicker;