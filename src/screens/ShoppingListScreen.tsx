// src/screens/ShoppingListScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput
} from 'react-native';
import { 
  Text, 
  Checkbox, 
  IconButton, 
  Divider, 
  FAB, 
  Button,
  TextInput,
  Dialog,
  Portal
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useShoppingListStore } from '../store/shoppingListStore';
import { ShoppingItem } from '../constants/shoppingList';

const ShoppingListScreen = () => {
  const navigation = useNavigation();
  const { 
    items, 
    isLoading, 
    loadItems, 
    addItem, 
    removeItem, 
    toggleItemCompletion, 
    clearCompleted 
  } = useShoppingListStore();
  
  // Dialog için state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Input referansı
  const nameInputRef = React.useRef<RNTextInput>(null);
  
  // Alışveriş listesini yükle
  useEffect(() => {
    loadItems();
  }, []);
  
  // Dialog fonksiyonları
  const showDialog = () => {
    setDialogVisible(true);
    
    // Dialog açıldığında input'a odaklan
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };
  
  const hideDialog = () => {
    setDialogVisible(false);
    setNewItemName('');
    setNewItemQuantity('');
  };
  
  // Yeni öğe ekleme
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Hata', 'Lütfen bir ürün adı girin.');
      return;
    }
    
    try {
      await addItem(newItemName.trim(), newItemQuantity.trim());
      hideDialog();
    } catch (error) {
      console.error('Öğe eklenirken hata:', error);
      Alert.alert('Hata', 'Ürün eklenirken bir hata oluştu.');
    }
  };
  
  // Öğe silme işlemi
  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Öğeyi Sil',
      'Bu ürünü alışveriş listenizden silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => removeItem(id)
        }
      ]
    );
  };
  
  // Tamamlanan öğeleri temizleme
  const handleClearCompleted = () => {
    const completedCount = items.filter(item => item.isCompleted).length;
    
    if (completedCount === 0) {
      Alert.alert('Bilgi', 'Tamamlanmış öğe bulunmuyor.');
      return;
    }
    
    Alert.alert(
      'Tamamlananları Temizle',
      `${completedCount} tamamlanmış öğeyi listeden kaldırmak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: clearCompleted
        }
      ]
    );
  };
  
  // Yenilenme işlemi
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };
  
  // Öğe renderlaması
  const renderItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.itemContainer}>
      <Checkbox
        status={item.isCompleted ? 'checked' : 'unchecked'}
        onPress={() => toggleItemCompletion(item.id)}
        color="#FF6B6B"
      />
      
      <View style={styles.itemContent}>
        <Text 
          style={[
            styles.itemName,
            item.isCompleted && styles.completedItem
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        
        {item.quantity ? (
          <Text 
            style={[
              styles.itemQuantity,
              item.isCompleted && styles.completedItem
            ]}
          >
            {item.quantity}
          </Text>
        ) : null}
      </View>
      
      <IconButton
        icon="delete-outline"
        size={24}
        onPress={() => handleRemoveItem(item.id)}
        iconColor="#FF6B6B"
      />
    </View>
  );
  
  // Başlık ve durum özeti
  const renderHeader = () => {
    const totalCount = items.length;
    const completedCount = items.filter(item => item.isCompleted).length;
    const pendingCount = totalCount - completedCount;
    
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Alışveriş Listesi</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Toplam: </Text>
              <Text style={styles.statValue}>{totalCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tamamlanan: </Text>
              <Text style={styles.statValue}>{completedCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Bekleyen: </Text>
              <Text style={styles.statValue}>{pendingCount}</Text>
            </View>
          </View>
        </View>
        
        <Button 
          mode="text" 
          onPress={handleClearCompleted}
          style={styles.clearButton}
          labelStyle={{ color: '#FF6B6B' }}
        >
          Tamamlananları Temizle
        </Button>
      </View>
    );
  };
  
  // Boş liste görünümü
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="cart-outline" size={80} color="#e0e0e0" />
      <Text style={styles.emptyText}>Alışveriş listeniz boş</Text>
      <Text style={styles.emptySubText}>Yeni ürün eklemek için + butonuna dokunun</Text>
    </View>
  );
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {renderHeader()}
      <Divider />
      
      <FlatList
        data={items.sort((a, b) => {
          // Önce tamamlanmayanları göster
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
          }
          // Sonra ekleme tarihine göre sırala (en yeni en üstte)
          return b.dateAdded - a.dateAdded;
        })}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showDialog}
        color="white"
      />
      
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>Yeni Ürün Ekle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Ürün Adı"
              value={newItemName}
              onChangeText={setNewItemName}
              style={styles.input}
              ref={nameInputRef}
              autoCapitalize="sentences"
            />
            <TextInput
              label="Miktar (Opsiyonel)"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              style={styles.input}
              placeholder="Örn: 1 kg, 500g, 2 adet"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>İptal</Button>
            <Button onPress={handleAddItem} mode="contained" style={{ backgroundColor: '#FF6B6B' }}>
              Ekle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    marginRight: 12,
  },
  statLabel: {
    color: '#757575',
  },
  statValue: {
    fontWeight: 'bold',
  },
  clearButton: {
    marginLeft: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontSize: 16,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  completedItem: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF6B6B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#757575',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
});

export default ShoppingListScreen;