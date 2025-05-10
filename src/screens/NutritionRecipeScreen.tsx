// src/screens/NutritionRecipeScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Title, 
  Chip, 
  ProgressBar, 
  Divider,
  Card,
  List,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchNutritionRecipe } from '../services/nutritionRecipeService';
import { generateDishImage } from '../services/imageService';
import { useRecipeStore } from '../store/recipeStore';
import CategoryPicker from '../components/CategoryPicker';
import { MEAL_TYPES, DIET_TYPES, DietType, MealType, NutritionInfo } from '../constants/nutrition';

type NutritionRecipeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NutritionRecipeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<NutritionRecipeScreenNavigationProp>();
  const { addOrUpdateRecipe } = useRecipeStore();
  
  // Temel tarif bilgileri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  
  // Beslenme bilgileri
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  // Öğün ve diyet tipleri
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  
  // AI yükleme durumu
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Kullanıcı girişleri için
  const [prompt, setPrompt] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [targetCarbs, setTargetCarbs] = useState('');
  const [targetFat, setTargetFat] = useState('');
  
  // Diyet tipi seçici
  const handleDietTypeToggle = (dietTypeId: string) => {
    if (selectedDietTypes.includes(dietTypeId)) {
      setSelectedDietTypes(selectedDietTypes.filter(id => id !== dietTypeId));
    } else {
      setSelectedDietTypes([...selectedDietTypes, dietTypeId]);
    }
  };
  
  // Öğün tipi seçici
  const handleMealTypeSelect = (mealTypeId: string) => {
    setSelectedMealType(mealTypeId === selectedMealType ? null : mealTypeId);
  };

  // AI ile tarif üretme
// generateNutritionRecipe fonksiyonunu güncelleyin:
const generateNutritionRecipe = async () => {
  if (!prompt || prompt.trim() === '') {
    Alert.alert("Uyarı", "Lütfen bir tarif tarifi girin.");
    return;
  }
  
  setIsLoading(true);
  
  try {
    // Seçilen diyet tiplerini isimlere dönüştürme
    const dietNames = selectedDietTypes.map(id => {
      const diet = DIET_TYPES.find(d => d.id === id);
      return diet ? diet.name : '';
    }).filter(name => name !== '');
    
    // Öğün tipini isme dönüştürme
    const mealName = selectedMealType 
      ? MEAL_TYPES.find(m => m.id === selectedMealType)?.name 
      : '';
      
    // Beslenme hedeflerini nesne olarak hazırlama
    const nutritionGoals: Partial<NutritionInfo> = {
      calories: targetCalories ? parseInt(targetCalories) : undefined,
      protein: targetProtein ? parseInt(targetProtein) : undefined,
      carbs: targetCarbs ? parseInt(targetCarbs) : undefined,
      fat: targetFat ? parseInt(targetFat) : undefined
    };
    
    // Yeni oluşturduğumuz beslenme odaklı tarif servisini kullan
    const recipeData = await fetchNutritionRecipe(
      prompt,
      nutritionGoals,
      dietNames,
      mealName
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
      
      // Kategori ID'sini ayarla (ÖNEMLİ DEĞİŞİKLİK)
      if (recipeData.categoryId) {
        setCategoryId(recipeData.categoryId);
        console.log('Kategori otomatik seçildi:', recipeData.categoryId);
      }
      
      // Beslenme bilgilerini API yanıtından al
      if (recipeData.nutritionInfo) {
        setNutritionInfo(recipeData.nutritionInfo);
      }
      
      // Görseli oluştur
      generateRecipeImage(recipeData.title);
    }
  } catch (error) {
    console.error("Tarif oluşturma hatası:", error);
    Alert.alert("Hata", "Tarif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
  } finally {
    setIsLoading(false);
  }
};
  
  // Görsel oluşturma
  const generateRecipeImage = async (recipeTitle: string) => {
    if (!recipeTitle) return;
    
    setIsGeneratingImage(true);
    try {
      const imagePrompt = `High quality food photography of ${recipeTitle}, on a plate, closeup, professional lighting, HD`;
      const generatedImageUrl = await generateDishImage(imagePrompt);
      
      if (generatedImageUrl) {
        setImageUrl(generatedImageUrl);
      }
    } catch (error) {
      console.error("Görsel oluşturma hatası:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Beslenme hedeflerini oluşturma
  const constructNutritionGoals = () => {
    // En az bir beslenme hedefi girilmeli
    if (!targetCalories && !targetProtein && !targetCarbs && !targetFat) {
      Alert.alert(
        "Eksik Beslenme Bilgisi", 
        "Lütfen en az bir beslenme hedefi girin (kalori, protein, karbonhidrat veya yağ)."
      );
      return null;
    }
    
    return {
      calories: targetCalories ? parseInt(targetCalories) : undefined,
      protein: targetProtein ? parseInt(targetProtein) : undefined,
      carbs: targetCarbs ? parseInt(targetCarbs) : undefined,
      fat: targetFat ? parseInt(targetFat) : undefined
    };
  };
  
  // Tarifi kaydetme
  const saveRecipe = async () => {
    if (!title.trim()) {
      Alert.alert("Uyarı", "Lütfen tarif başlığı girin.");
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
        nutritionInfo,
        mealTypeId: selectedMealType || undefined,
        dietTypeIds: selectedDietTypes.length > 0 ? selectedDietTypes : undefined
      });
      
      if (recipe) {
        Alert.alert(
          "Başarılı",
          "Tarif başarıyla kaydedildi.",
          [{ text: "Tamam", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Tarif kaydetme hatası:", error);
      Alert.alert("Hata", "Tarif kaydedilirken bir hata oluştu.");
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Card style={styles.promptCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Beslenme Odaklı Tarif Oluştur</Title>
              
              <TextInput
                label="Ne yemek istiyorsunuz? (ör: Tavuklu salata, protein bar, vb.)"
                value={prompt}
                onChangeText={setPrompt}
                style={styles.input}
                multiline
              />
              
              <Title style={styles.subSectionTitle}>Beslenme Hedefleri</Title>
              <View style={styles.nutritionInputsRow}>
                <TextInput
                  label="Kalori (kcal)"
                  value={targetCalories}
                  onChangeText={setTargetCalories}
                  style={styles.nutritionInput}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Protein (g)"
                  value={targetProtein}
                  onChangeText={setTargetProtein}
                  style={styles.nutritionInput}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.nutritionInputsRow}>
                <TextInput
                  label="Karbonhidrat (g)"
                  value={targetCarbs}
                  onChangeText={setTargetCarbs}
                  style={styles.nutritionInput}
                  keyboardType="numeric"
                />
                <TextInput
                  label="Yağ (g)"
                  value={targetFat}
                  onChangeText={setTargetFat}
                  style={styles.nutritionInput}
                  keyboardType="numeric"
                />
              </View>
              
              <Title style={styles.subSectionTitle}>Öğün Tipi</Title>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {MEAL_TYPES.map((mealType) => (
                  <Chip
                    key={mealType.id}
                    icon={mealType.icon}
                    selected={selectedMealType === mealType.id}
                    onPress={() => handleMealTypeSelect(mealType.id)}
                    style={[
                      styles.chip,
                      selectedMealType === mealType.id ? styles.selectedChip : {}
                    ]}
                    selectedColor={selectedMealType === mealType.id ? theme.colors.primary : undefined}
                  >
                    {mealType.name}
                  </Chip>
                ))}
              </ScrollView>
              
              <Title style={styles.subSectionTitle}>Diyet Tipi</Title>
              <View style={styles.dietTypesContainer}>
                {DIET_TYPES.map((dietType) => (
                  <Chip
                    key={dietType.id}
                    icon={dietType.icon}
                    selected={selectedDietTypes.includes(dietType.id)}
                    onPress={() => handleDietTypeToggle(dietType.id)}
                    style={[
                      styles.dietChip,
                      selectedDietTypes.includes(dietType.id) ? styles.selectedChip : {}
                    ]}
                    selectedColor={selectedDietTypes.includes(dietType.id) ? theme.colors.primary : undefined}
                  >
                    {dietType.name}
                  </Chip>
                ))}
              </View>
              
              <Button 
                mode="contained" 
                onPress={generateNutritionRecipe}
                style={styles.generateButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Tarif Oluştur
              </Button>
            </Card.Content>
          </Card>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Tarifler aranıyor...</Text>
            </View>
          ) : (
            title ? (
              <Card style={styles.resultCard}>
                <Card.Content>
                  <Title style={styles.sectionTitle}>Oluşturulan Tarif</Title>
                  
                  {isGeneratingImage ? (
                    <View style={styles.imageLoading}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text>Görsel oluşturuluyor...</Text>
                    </View>
                  ) : (
                    imageUrl ? (
                      <Card.Cover source={{ uri: imageUrl }} style={styles.recipeImage} />
                    ) : null
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
                  
                  <Card style={styles.nutritionCard}>
                    <Card.Content>
                      <Title style={styles.nutritionTitle}>Besin Değerleri (1 Porsiyon)</Title>
                      
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Kalori:</Text>
                        <Text style={styles.nutritionValue}>{nutritionInfo.calories} kcal</Text>
                      </View>
                      
                      <View style={styles.nutritionBarContainer}>
                        <View style={styles.nutritionBarLabel}>
                          <Text>Protein</Text>
                          <Text>{nutritionInfo.protein}g</Text>
                        </View>
                        <ProgressBar 
                          progress={nutritionInfo.protein / (nutritionInfo.protein + nutritionInfo.carbs + nutritionInfo.fat) || 0} 
                          color="#FF6B6B" 
                          style={styles.nutritionBar} 
                        />
                        
                        <View style={styles.nutritionBarLabel}>
                          <Text>Karbonhidrat</Text>
                          <Text>{nutritionInfo.carbs}g</Text>
                        </View>
                        <ProgressBar 
                          progress={nutritionInfo.carbs / (nutritionInfo.protein + nutritionInfo.carbs + nutritionInfo.fat) || 0} 
                          color="#4CAF50" 
                          style={styles.nutritionBar} 
                        />
                        
                        <View style={styles.nutritionBarLabel}>
                          <Text>Yağ</Text>
                          <Text>{nutritionInfo.fat}g</Text>
                        </View>
                        <ProgressBar 
                          progress={nutritionInfo.fat / (nutritionInfo.protein + nutritionInfo.carbs + nutritionInfo.fat) || 0} 
                          color="#2196F3" 
                          style={styles.nutritionBar} 
                        />
                      </View>
                      
                      <TextInput
                        label="Kalori (kcal)"
                        value={nutritionInfo.calories.toString()}
                        onChangeText={(value) => setNutritionInfo({...nutritionInfo, calories: parseInt(value) || 0})}
                        keyboardType="numeric"
                        style={styles.nutritionEditInput}
                      />
                      
                      <View style={styles.nutritionInputsRow}>
                        <TextInput
                          label="Protein (g)"
                          value={nutritionInfo.protein.toString()}
                          onChangeText={(value) => setNutritionInfo({...nutritionInfo, protein: parseInt(value) || 0})}
                          keyboardType="numeric"
                          style={styles.nutritionEditInput}
                        />
                        <TextInput
                          label="Karbonhidrat (g)"
                          value={nutritionInfo.carbs.toString()}
                          onChangeText={(value) => setNutritionInfo({...nutritionInfo, carbs: parseInt(value) || 0})}
                          keyboardType="numeric"
                          style={styles.nutritionEditInput}
                        />
                        <TextInput
                          label="Yağ (g)"
                          value={nutritionInfo.fat.toString()}
                          onChangeText={(value) => setNutritionInfo({...nutritionInfo, fat: parseInt(value) || 0})}
                          keyboardType="numeric"
                          style={styles.nutritionEditInput}
                        />
                      </View>
                    </Card.Content>
                  </Card>
                  
                  <Title style={styles.subSectionTitle}>Malzemeler</Title>
                  <List.Section>
                    {ingredients.map((ingredient, index) => (
                      <List.Item
                        key={index}
                        title={ingredient}
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
  promptCard: {
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
  subSectionTitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 12,
  },
  timeServingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  dietTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dietChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  generateButton: {
    marginTop: 16,
  },
  recipeImage: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  nutritionInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 12,
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
  nutritionCard: {
    marginVertical: 16,
    backgroundColor: '#f9f9f9',
  },
  nutritionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutritionValue: {
    fontSize: 16,
  },
  nutritionBarContainer: {
    marginVertical: 12,
  },
  nutritionBarLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nutritionBar: {
    height: 10,
    borderRadius: 5,
  },
  nutritionEditInput: {
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
});

export default NutritionRecipeScreen;