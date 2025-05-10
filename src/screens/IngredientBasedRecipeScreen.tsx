// src/screens/IngredientBasedRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Title,
  Chip,
  Divider,
  Card,
  List,
  ActivityIndicator,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchIngredientBasedRecipe } from '../services/ingredientBasedRecipeService';
import { generateDishImage } from '../services/imageService';
import { useRecipeStore } from '../store/recipeStore';
import CategoryPicker from '../components/CategoryPicker';

type IngredientBasedRecipeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const IngredientBasedRecipeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<IngredientBasedRecipeScreenNavigationProp>();
  const { addOrUpdateRecipe } = useRecipeStore();

  // Kullanıcı girdileri
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [newExcludedIngredient, setNewExcludedIngredient] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Tarif veri modeli
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]); // Eksik malzemeler

  // Durum değişkenleri
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [recommendedRecipes, setRecommendedRecipes] = useState<string[]>([]);
  const [resultVisible, setResultVisible] = useState(false); // Sonuç kartının görünürlüğü

  // Malzeme ekleme
  const addIngredient = () => {
    if (newIngredient.trim() !== '') {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  // Malzeme çıkarma
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
  };

  // Hariç tutulan malzeme ekleme
  const addExcludedIngredient = () => {
    if (newExcludedIngredient.trim() !== '') {
      setExcludedIngredients([...excludedIngredients, newExcludedIngredient.trim()]);
      setNewExcludedIngredient('');
    }
  };

  // Hariç tutulan malzeme çıkarma
  const removeExcludedIngredient = (index: number) => {
    const updatedExcludedIngredients = [...excludedIngredients];
    updatedExcludedIngredients.splice(index, 1);
    setExcludedIngredients(updatedExcludedIngredients);
  };

  // Tarif önerilerini al
  const getRecipeRecommendations = () => {
    if (ingredients.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir malzeme ekleyin.');
      return;
    }

    // Basit tarif önerileri üret
    const possibleRecipes = [];
    
    if (ingredients.some(i => i.toLowerCase().includes('tavuk'))) {
      possibleRecipes.push('Tavuklu Makarna', 'Fırın Tavuk', 'Tavuk Sote');
    }
    
    if (ingredients.some(i => i.toLowerCase().includes('kıyma'))) {
      possibleRecipes.push('Köfte', 'Bolonez Sos', 'İçli Köfte');
    }
    
    if (ingredients.some(i => i.toLowerCase().includes('patates'))) {
      possibleRecipes.push('Patates Kızartması', 'Fırın Patates', 'Patates Püresi');
    }
    
    if (ingredients.some(i => i.toLowerCase().includes('un')) && 
        ingredients.some(i => i.toLowerCase().includes('yumurta'))) {
      possibleRecipes.push('Krep', 'Kek', 'Kurabiye');
    }
    
    // Daha fazla öneri ekle
    possibleRecipes.push('Sebzeli Pilav', 'Omlet', 'Domates Çorbası', 'Mercimek Çorbası');
    
    // Rastgele birkaç tarif seç
    const recommendations = [...possibleRecipes];
    // Karıştır
    for (let i = recommendations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
    }
    
    setRecommendedRecipes(recommendations.slice(0, 4));
  };

  // Öneriyi seç
  const selectRecommendation = (recipe: string) => {
    setRecipeType(recipe);
  };

  // Tarif oluştur
  const generateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir malzeme ekleyin.');
      return;
    }

    setIsLoading(true);
    setResultVisible(false); // Sonucu gizle, yeni tarif oluşana kadar

    try {
      // Yeni servisimizi kullanalım
      const recipeData = await fetchIngredientBasedRecipe(
        ingredients,
        excludedIngredients,
        recipeType,
        additionalNotes
      );
      
      if (recipeData) {
        // Verileri state'e ata
        setTitle(recipeData.title || '');
        setDescription(recipeData.description || '');
        setRecipeIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || []);
        setPrepTime(recipeData.prepTime || 0);
        setCookTime(recipeData.cookTime || 0);
        setServings(recipeData.servings || 1);
        
        // Kategori bilgisini otomatik olarak ayarla
        if (recipeData.categoryId) {
          setCategoryId(recipeData.categoryId);
          console.log('Kategori otomatik seçildi:', recipeData.categoryId);
        }
        
        // Eksik malzemeleri kaydet
        if (recipeData.missingIngredients && recipeData.missingIngredients.length > 0) {
          setMissingIngredients(recipeData.missingIngredients);
        } else {
          setMissingIngredients([]);
        }

        // Görseli oluştur
        await generateRecipeImage(recipeData.title);
        
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

  // Görsel oluşturma - async/await ile daha düzgün çalışacak
  const generateRecipeImage = async (recipeTitle: string) => {
    if (!recipeTitle) return null;
    
    setIsGeneratingImage(true);
    try {
      const imagePrompt = `High quality food photography of ${recipeTitle}, on a plate, closeup, professional lighting, HD`;
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
        ingredients: recipeIngredients,
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

  // Tarif önerilerini hesapla
  useEffect(() => {
    if (ingredients.length > 0) {
      getRecipeRecommendations();
    }
  }, [ingredients]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Eldeki Malzemeler</Title>
              <Text style={styles.subtitle}>
                Evinizdeki malzemeleri ekleyin ve size uygun tarif önerileri alın
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Malzeme Ekle"
                  value={newIngredient}
                  onChangeText={setNewIngredient}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon="plus"
                      onPress={addIngredient}
                    />
                  }
                  onSubmitEditing={() => {
                    addIngredient();
                  }}
                />
              </View>

              <View style={styles.chipsContainer}>
                {ingredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    onClose={() => removeIngredient(index)}
                    icon="food-variant"
                  >
                    {ingredient}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />

              <Title style={styles.secondaryTitle}>İstenmeyen Malzemeler</Title>
              <Text style={styles.subtitle}>
                Kullanmak istemediğiniz malzemeleri ekleyin
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="İstenmeyen Malzeme"
                  value={newExcludedIngredient}
                  onChangeText={setNewExcludedIngredient}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon="plus"
                      onPress={addExcludedIngredient}
                    />
                  }
                  onSubmitEditing={() => {
                    addExcludedIngredient();
                  }}
                />
              </View>

              <View style={styles.chipsContainer}>
                {excludedIngredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    style={[styles.chip, styles.excludedChip]}
                    onClose={() => removeExcludedIngredient(index)}
                    icon="close-circle"
                  >
                    {ingredient}
                  </Chip>
                ))}
              </View>

              <Divider style={styles.divider} />

              {recommendedRecipes.length > 0 && (
                <>
                  <Title style={styles.secondaryTitle}>Önerilebilecek Tarifler</Title>
                  <View style={styles.recommendationsContainer}>
                    {recommendedRecipes.map((recipe, index) => (
                      <Chip
                        key={index}
                        style={[
                          styles.recommendationChip,
                          recipeType === recipe ? styles.selectedRecommendation : {}
                        ]}
                        onPress={() => selectRecommendation(recipe)}
                        icon={recipeType === recipe ? "check" : "food"}
                        selected={recipeType === recipe}
                      >
                        {recipe}
                      </Chip>
                    ))}
                  </View>

                  <Divider style={styles.divider} />
                </>
              )}

              <Title style={styles.secondaryTitle}>Tarif Tercihi</Title>
              <TextInput
                label="Ne tür bir yemek istersiniz? (ör: çorba, makarna, vs.)"
                value={recipeType}
                onChangeText={setRecipeType}
                style={styles.input}
              />

              <TextInput
                label="Ek Notlar (isteğe bağlı)"
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                style={styles.input}
                multiline
                numberOfLines={3}
                placeholder="Diyet kısıtlamaları, pişirme tercihleri veya başka notlar..."
              />

              <Button
                mode="contained"
                onPress={generateRecipe}
                style={styles.generateButton}
                loading={isLoading}
                disabled={isLoading || ingredients.length === 0}
              >
                Tarif Oluştur
              </Button>
            </Card.Content>
          </Card>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Malzemelerinize uygun tarif oluşturuluyor...</Text>
            </View>
          ) : (
            // resultVisible kontrolüyle sadece tarif VE görsel hazır olduğunda göster
            resultVisible && title ? (
              <Card style={styles.resultCard}>
                <Card.Content>
                  <Title style={styles.sectionTitle}>Oluşturulan Tarif</Title>

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

                  <TextInput
                    label="Açıklama"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                    multiline
                  />

                  {/* Eksik malzemeler kısmını ekleyelim */}
                  {missingIngredients.length > 0 && (
                    <>
                      <Title style={styles.subSectionTitle}>Eksik Malzemeler</Title>
                      <View style={styles.missingIngredientsContainer}>
                        {missingIngredients.map((ingredient, index) => (
                          <Chip
                            key={index}
                            style={styles.missingChip}
                            icon="information"
                            mode="outlined"
                          >
                            {ingredient}
                          </Chip>
                        ))}
                      </View>
                    </>
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
                    {recipeIngredients.map((ingredient, index) => (
                      <List.Item
                        key={index}
                        title={ingredient}
                        left={() => <List.Icon icon="circle-small" />}
                        right={() => (
                          <TouchableOpacity onPress={() => {
                            const newIngredients = [...recipeIngredients];
                            newIngredients.splice(index, 1);
                            setRecipeIngredients(newIngredients);
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
                          setRecipeIngredients([...recipeIngredients, newText.trim()]);
                        }
                      }}
                      style={styles.addItemInput}
                      onSubmitEditing={(e) => {
                        const text = e.nativeEvent.text.trim();
                        if (text !== '') {
                          setRecipeIngredients([...recipeIngredients, text]);
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
                      style={styles.saveButton}
                    >
                      Tarifi Kaydet
                    </Button>
                  </View>
                </Card.Content>
              </Card>
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
  formContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  resultCard: {
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  secondaryTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    margin: 4,
  },
  excludedChip: {
    backgroundColor: '#ffcdd2',
  },
  divider: {
    marginVertical: 16,
  },
  recommendationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  recommendationChip: {
    margin: 4,
    backgroundColor: '#e3f2fd',
  },
  selectedRecommendation: {
    backgroundColor: '#bbdefb',
  },
  generateButton: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
  subSectionTitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
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
  missingIngredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  missingChip: {
    margin: 4,
    backgroundColor: '#fff3e0',
    borderColor: '#ffcc80',
  },
});

export default IngredientBasedRecipeScreen;