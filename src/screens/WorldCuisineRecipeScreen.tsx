// src/screens/WorldCuisineRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Title,
  Card,
  List,
  ActivityIndicator,
  Chip,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchWorldCuisineRecipe } from '../services/worldCuisineRecipeService';
import { generateDishImage } from '../services/imageService';
import { useRecipeStore } from '../store/recipeStore';
import CategoryPicker from '../components/CategoryPicker';
import { CUISINES, Cuisine } from '../constants/cuisines';

type WorldCuisineRecipeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = 10;

const WorldCuisineRecipeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WorldCuisineRecipeScreenNavigationProp>();
  const { addOrUpdateRecipe } = useRecipeStore();

  // Debug için CUISINES verisini kontrol edelim
  useEffect(() => {
    console.log('CUISINES data count:', CUISINES.length);
  }, []);

  // Seçilen mutfak ve diğer bilgiler
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [specificDish, setSpecificDish] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Tarif veri modeli
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [cuisineInfo, setCuisineInfo] = useState<{
    originalName?: string;
    region?: string;
    history?: string;
    servingSuggestions?: string[];
  }>({});

  // Durum değişkenleri
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [resultVisible, setResultVisible] = useState(false); // Sonuç kartının görünürlüğü

  // Rastgele tarif yerine özel yemek seçimi
  const [useRandomDish, setUseRandomDish] = useState(true);

  // Mutfak seçimi yapma
  const handleSelectCuisine = (cuisine: Cuisine) => {
    setSelectedCuisine(cuisine);
  };

  // Popüler yemek seçimi
  const handleSelectPopularDish = (dish: string) => {
    setSpecificDish(dish);
    setUseRandomDish(false);
  };

  // Rastgele yemek oluşturma
  const handleRandomDish = () => {
    setSpecificDish('');
    setUseRandomDish(true);
  };

  // Dünya mutfağı tarifini oluşturma
  const generateWorldCuisineRecipe = async () => {
    if (!selectedCuisine) {
      Alert.alert('Uyarı', 'Lütfen bir mutfak türü seçin.');
      return;
    }

    setIsLoading(true);
    setResultVisible(false); // Sonucu gizle, yeni tarif oluşana kadar

    try {
      // Dünya mutfakları servisini kullanalım
      const recipeData = await fetchWorldCuisineRecipe(
        selectedCuisine.name,
        specificDish,
        additionalNotes,
        useRandomDish
      );
      
      if (recipeData) {
        // Verileri state'e ata
        setTitle(recipeData.title || '');
        setDescription(recipeData.description || '');
        setIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || []);
        setPrepTime(recipeData.prepTime || 0);
        setCookTime(recipeData.cookTime || 0);
        setServings(recipeData.servings || 1);
        
        // Kategori bilgisini otomatik olarak ayarla
        if (recipeData.categoryId) {
          setCategoryId(recipeData.categoryId);
          console.log('Kategori otomatik seçildi:', recipeData.categoryId);
        }
        
        // Mutfak bilgilerini kaydet
        if (recipeData.cuisineInfo) {
          setCuisineInfo(recipeData.cuisineInfo);
        } else {
          setCuisineInfo({});
        }

        // Görseli oluştur
        await generateRecipeImage(recipeData.title, selectedCuisine.name);
        
        // Sonucu görünür yap (görsel de oluştuktan sonra)
        setResultVisible(true);
      }
    } catch (error) {
      console.error('Tarif oluşturma hatası:', error);
      Alert.alert('Hata', 'Tarif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Görsel oluşturma
  const generateRecipeImage = async (recipeTitle: string, cuisineName: string) => {
    if (!recipeTitle) return null;
    
    setIsGeneratingImage(true);
    try {
      // Mutfak tipini de ekleyerek daha spesifik görseller alalım
      const imagePrompt = `High quality food photography of ${recipeTitle}, ${cuisineName} cuisine, on a plate with traditional serving style, closeup, professional lighting, HD`;
      const generatedImageUrl = await generateDishImage(imagePrompt);
      
      if (generatedImageUrl) {
        setImageUrl(generatedImageUrl);
        return generatedImageUrl;
      }
      return null;
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Tarifi kaydetme
  const saveRecipe = async () => {
    if (!title.trim()) {
      Alert.alert('Uyarı', 'Lütfen tarif başlığı girin.');
      return;
    }
    
    try {
      const recipe = await addOrUpdateRecipe({
        title,
        description,
        imageUrl,
        ingredients,
        instructions,
        prepTime,
        cookTime,
        servings,
        categoryId: categoryId || 'diger',
      });
      
      if (recipe) {
        Alert.alert(
          'Başarılı',
          'Tarif başarıyla kaydedildi.',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Tarif kaydetme hatası:', error);
      Alert.alert('Hata', 'Tarif kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Title style={styles.mainTitle}>Dünya Mutfakları</Title>
          <Text style={styles.subtitle}>Farklı ülkelerin mutfaklarını keşfedin ve otantik tarifler oluşturun</Text>

          {/* Basit grid düzeni ile mutfakları gösterme */}
          <View style={styles.cuisinesGrid}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity 
                key={cuisine.id} 
                style={[
                  styles.cuisineItem,
                  selectedCuisine?.id === cuisine.id ? { 
                    backgroundColor: cuisine.color + '30',
                    borderWidth: 2,
                    borderColor: cuisine.color
                  } : {}
                ]}
                onPress={() => handleSelectCuisine(cuisine)}
              >
                <View style={[styles.cuisineIconContainer, { backgroundColor: cuisine.color + '20' }]}>
                  <MaterialCommunityIcons name={cuisine.icon} size={32} color={cuisine.color} />
                </View>
                <Text style={styles.cuisineName}>{cuisine.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedCuisine && (
            <View style={styles.cardWrapper}>
              <Card style={styles.selectedCuisineCard}>
                <Card.Content>
                  <Title style={styles.sectionTitle}>
                    <MaterialCommunityIcons 
                      name={selectedCuisine.icon} 
                      size={24} 
                      color={selectedCuisine.color} 
                    /> <Text>{selectedCuisine.name}</Text>
                  </Title>
                  
                  <Text style={styles.cuisineDescription}>{selectedCuisine.description}</Text>

                  <View style={styles.optionsContainer}>
                    <Title style={styles.subSectionTitle}>Tarif Seçenekleri</Title>
                    
                    <View style={styles.dishTypeSelector}>
                      <Button
                        mode={useRandomDish ? "contained" : "outlined"}
                        onPress={handleRandomDish}
                        style={styles.dishTypeButton}
                      >
                        Rastgele Yemek
                      </Button>
                      
                      <Button
                        mode={!useRandomDish ? "contained" : "outlined"}
                        onPress={() => setUseRandomDish(false)}
                        style={styles.dishTypeButton}
                        disabled={!specificDish}
                      >
                        Özel Yemek
                      </Button>
                    </View>

                    {!useRandomDish && (
                      <TextInput
                        label="Hangi yemeği denemek istersiniz?"
                        value={specificDish}
                        onChangeText={setSpecificDish}
                        style={styles.input}
                        right={
                          specificDish ? (
                            <TextInput.Icon
                              icon="close"
                              onPress={() => setSpecificDish('')}
                            />
                          ) : null
                        }
                      />
                    )}

                    <View style={styles.allPopularDishesContainer}>
                      <Text style={styles.popularDishesText}>Popüler Yemekler:</Text>
                      <View style={styles.popularDishesScrollContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {selectedCuisine.popularDishes.map((dish, idx) => (
                            <Chip
                              key={idx}
                              onPress={() => handleSelectPopularDish(dish)}
                              selected={specificDish === dish}
                              style={[
                                styles.popularDishChip,
                                specificDish === dish ? { backgroundColor: selectedCuisine.color + '30' } : {}
                              ]}
                              selectedColor={selectedCuisine.color}
                            >
                              <Text>{dish}</Text>
                            </Chip>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    <TextInput
                      label="Ek Notlar (isteğe bağlı)"
                      value={additionalNotes}
                      onChangeText={setAdditionalNotes}
                      style={styles.input}
                      multiline
                      numberOfLines={3}
                      placeholder="Diyet kısıtlamaları, malzeme tercihleri veya başka notlar..."
                    />

                    <Button
                      mode="contained"
                      onPress={generateWorldCuisineRecipe}
                      style={[styles.generateButton, { backgroundColor: selectedCuisine.color }]}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Tarif Oluştur
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={selectedCuisine?.color || theme.colors.primary} />
              <Text style={styles.loadingText}>
                {selectedCuisine?.name} mutfağından tarif oluşturuluyor...
              </Text>
            </View>
          ) : (
            // resultVisible kontrolüyle sadece tarif VE görsel hazır olduğunda göster
            resultVisible && title ? (
              <View style={styles.cardWrapper}>
                <Card style={styles.resultCard}>
                  <Card.Content>
                    <Title style={styles.sectionTitle}>
                      <MaterialCommunityIcons 
                        name={selectedCuisine?.icon || 'food'} 
                        size={24} 
                        color={selectedCuisine?.color || theme.colors.primary} 
                      /> <Text>{selectedCuisine?.name} Tarifi</Text>
                    </Title>

                    {imageUrl ? (
                      <Card.Cover source={{ uri: imageUrl }} style={styles.recipeImage} />
                    ) : (
                      <View style={styles.imageLoading}>
                        <Text>Görsel oluşturulamadı</Text>
                      </View>
                    )}

                    <TextInput
                      label="Tarif Adı"
                      value={title}
                      onChangeText={setTitle}
                      style={styles.input}
                    />

                    {cuisineInfo.originalName && (
                      <View style={styles.cuisineInfoItem}>
                        <Text style={styles.cuisineInfoLabel}>Orijinal Adı:</Text>
                        <Text style={styles.cuisineInfoValue}>{cuisineInfo.originalName}</Text>
                      </View>
                    )}

                    <TextInput
                      label="Açıklama"
                      value={description}
                      onChangeText={setDescription}
                      style={styles.input}
                      multiline
                    />

                    {/* Mutfak bilgileri kartı */}
                    {(cuisineInfo.region || cuisineInfo.history || cuisineInfo.servingSuggestions) && (
                      <View style={styles.cardWrapper}>
                        <Card style={[styles.cuisineInfoCard, { backgroundColor: selectedCuisine?.color + '10' }]}>
                          <Card.Content>
                            <Title style={styles.cuisineInfoTitle}>Mutfak Bilgileri</Title>
                            
                            {cuisineInfo.region && (
                              <View style={styles.cuisineInfoItem}>
                                <Text style={styles.cuisineInfoLabel}>Bölge:</Text>
                                <Text style={styles.cuisineInfoValue}>{cuisineInfo.region}</Text>
                              </View>
                            )}
                            
                            {cuisineInfo.history && (
                              <View style={styles.cuisineInfoItem}>
                                <Text style={styles.cuisineInfoLabel}>Tarihçe:</Text>
                                <Text style={styles.cuisineInfoValue}>{cuisineInfo.history}</Text>
                              </View>
                            )}
                            
                            {cuisineInfo.servingSuggestions && cuisineInfo.servingSuggestions.length > 0 && (
                              <View style={styles.cuisineInfoItem}>
                                <Text style={styles.cuisineInfoLabel}>Servis Önerileri:</Text>
                                {cuisineInfo.servingSuggestions.map((suggestion, index) => (
                                  <View key={index} style={styles.suggestionItem}>
                                    <MaterialCommunityIcons name="silverware" size={16} color={selectedCuisine?.color || theme.colors.primary} />
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </Card.Content>
                        </Card>
                      </View>
                    )}

                    <View style={styles.timeServingsRow}>
                      <TextInput
                        label="Hazırlama Süresi (dk)"
                        value={prepTime.toString()}
                        onChangeText={(value) => setPrepTime(parseInt(value) || 0)}
                        keyboardType="numeric"
                        style={styles.smallInput}
                      />
                      <TextInput
                        label="Pişirme Süresi (dk)"
                        value={cookTime.toString()}
                        onChangeText={(value) => setCookTime(parseInt(value) || 0)}
                        keyboardType="numeric"
                        style={styles.smallInput}
                      />
                      <TextInput
                        label="Porsiyon"
                        value={servings.toString()}
                        onChangeText={(value) => setServings(parseInt(value) || 1)}
                        keyboardType="numeric"
                        style={styles.smallInput}
                      />
                    </View>

                    <Title style={styles.subSectionTitle}>Malzemeler</Title>
                    <List.Section>
                      {ingredients.map((ingredient, index) => (
                        <List.Item
                          key={index}
                          title={ingredient}
                          titleNumberOfLines={3}
                          titleStyle={{ flexWrap: 'wrap' }}
                          left={() => <List.Icon icon="circle-small" />}
                          right={() => (
                            <TouchableOpacity onPress={() => {
                              const newIngredients = [...ingredients];
                              newIngredients.splice(index, 1);
                              setIngredients(newIngredients);
                            }}>
                              <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                          )}
                        />
                      ))}
                    </List.Section>

                    <View style={styles.addItemRow}>
                      <TextInput
                        label="Yeni Malzeme"
                        value=""
                        onChangeText={(newText) => {
                          if (newText.trim() !== '') {
                            setIngredients([...ingredients, newText.trim()]);
                          }
                        }}
                        style={styles.addItemInput}
                        onSubmitEditing={(e) => {
                          const text = e.nativeEvent.text.trim();
                          if (text !== '') {
                            setIngredients([...ingredients, text]);
                            e.currentTarget.clear();
                          }
                        }}
                      />
                    </View>

                    <Title style={styles.subSectionTitle}>Hazırlama Adımları</Title>
                    <List.Section>
                      {instructions.map((instruction, index) => (
                        <List.Item
                          key={index}
                          title={instruction}
                          titleNumberOfLines={5}
                          titleStyle={{ flexWrap: 'wrap' }}
                          left={() => <List.Icon icon={`numeric-${index + 1}-circle`} />}
                          right={() => (
                            <TouchableOpacity onPress={() => {
                              const newInstructions = [...instructions];
                              newInstructions.splice(index, 1);
                              setInstructions(newInstructions);
                            }}>
                              <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                          )}
                        />
                      ))}
                    </List.Section>

                    <View style={styles.addItemRow}>
                      <TextInput
                        label="Yeni Adım"
                        value=""
                        onChangeText={(newText) => {
                          if (newText.trim() !== '') {
                            setInstructions([...instructions, newText.trim()]);
                          }
                        }}
                        style={styles.addItemInput}
                        onSubmitEditing={(e) => {
                          const text = e.nativeEvent.text.trim();
                          if (text !== '') {
                            setInstructions([...instructions, text]);
                            e.currentTarget.clear();
                          }
                        }}
                      />
                    </View>

                    <Title style={styles.subSectionTitle}>Kategori</Title>
                    <CategoryPicker
                      selectedCategoryId={categoryId}
                      onSelectCategory={(id) => setCategoryId(id)}
                    />

                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={saveRecipe}
                        style={[
                          styles.saveButton,
                          { backgroundColor: selectedCuisine?.color || theme.colors.primary }
                        ]}
                      >
                        Tarifi Kaydet
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            ) : null
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Karüsel alternatifi olarak grid düzeni
  cuisinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  cuisineItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    alignItems: 'center',
  },
  cuisineIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cuisineName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  cardWrapper: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  selectedCuisineCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cuisineDescription: {
    marginVertical: 8,
    fontSize: 14,
    color: '#555',
  },
  optionsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  dishTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dishTypeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 12,
  },
  allPopularDishesContainer: {
    marginBottom: 16,
  },
  popularDishesText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  popularDishesScrollContainer: {
    marginBottom: 8,
  },
  popularDishChip: {
    margin: 4,
  },
  generateButton: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  imageLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  recipeImage: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  timeServingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 12,
  },
  addItemRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addItemInput: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    flex: 1,
  },
  // Yeni eklenen stiller
  cuisineInfoCard: {
    marginVertical: 16,
    borderRadius: 8,
  },
  cuisineInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cuisineInfoItem: {
    marginBottom: 10,
  },
  cuisineInfoLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  cuisineInfoValue: {
    fontSize: 14,
    marginBottom: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingLeft: 8,
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default WorldCuisineRecipeScreen;