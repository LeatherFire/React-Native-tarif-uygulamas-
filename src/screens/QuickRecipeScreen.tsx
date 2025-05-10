// src/screens/QuickRecipeScreen.tsx
import React, { useState } from 'react';
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
  Slider,
  RadioButton,
  Surface,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchRecipe } from '../services/openaiService';
import { generateDishImage } from '../services/imageService';
import { useRecipeStore } from '../store/recipeStore';
import CategoryPicker from '../components/CategoryPicker';

type QuickRecipeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Zorluk seviyeleri
const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Kolay', icon: 'numeric-1-circle', color: '#4CAF50' },
  { value: 'medium', label: 'Orta', icon: 'numeric-2-circle', color: '#FF9800' },
  { value: 'hard', label: 'Zor', icon: 'numeric-3-circle', color: '#F44336' },
];

// Ekipman seçenekleri
const EQUIPMENT_OPTIONS = [
  { value: 'minimal', label: 'Minimum Ekipman', icon: 'silverware' },
  { value: 'single-pot', label: 'Tek Tencere', icon: 'pot' },
  { value: 'any', label: 'Herhangi Bir Ekipman', icon: 'blender' },
];

// Öğün tipleri
const MEAL_TYPES = [
  { value: 'breakfast', label: 'Kahvaltı', icon: 'food-croissant' },
  { value: 'lunch', label: 'Öğle Yemeği', icon: 'food-drumstick' },
  { value: 'dinner', label: 'Akşam Yemeği', icon: 'food-steak' },
  { value: 'snack', label: 'Atıştırmalık', icon: 'food-apple' },
];

const QuickRecipeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<QuickRecipeScreenNavigationProp>();
  const { addOrUpdateRecipe } = useRecipeStore();

  // Kullanıcı girdileri
  const [cookingTime, setCookingTime] = useState(30); // Dakika cinsinden
  const [difficultyLevel, setDifficultyLevel] = useState<string>('easy');
  const [equipmentType, setEquipmentType] = useState<string>('any');
  const [mealType, setMealType] = useState<string>('');
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

  // Durum değişkenleri
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Hızlı tarif oluşturma
  const generateQuickRecipe = async () => {
    setIsLoading(true);

    try {
      // Seçilen zorluk seviyesi
      const difficulty = DIFFICULTY_LEVELS.find(d => d.value === difficultyLevel)?.label || 'Kolay';
      
      // Seçilen ekipman türü
      const equipment = EQUIPMENT_OPTIONS.find(e => e.value === equipmentType)?.label || 'Herhangi Bir Ekipman';
      
      // Seçilen öğün türü
      const meal = mealType ? MEAL_TYPES.find(m => m.value === mealType)?.label || '' : '';
      
      const prompt = `
        En fazla ${cookingTime} dakikada tamamlanabilecek (toplam hazırlama ve pişirme süresi) ${difficulty.toLowerCase()} seviyede bir yemek tarifi oluştur.
        Ekipman kısıtlaması: ${equipment}.
        ${meal ? `Öğün tipi: ${meal}.` : ''}
        ${additionalNotes ? `Ek notlar: ${additionalNotes}` : ''}
        
        Adımları basit ve anlaşılır tut. Zamanlama çok önemli, tarifin belirtilen süre içinde gerçekten tamamlanabilir olmasına dikkat et.
      `;

      console.log('Gönderilen prompt:', prompt);

      const recipeData = await fetchRecipe(prompt);
      
      if (recipeData) {
        // Verileri state'e ata
        setTitle(recipeData.title || '');
        setDescription(recipeData.description || '');
        setIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || []);
        setPrepTime(recipeData.prepTime || 0);
        setCookTime(recipeData.cookTime || 0);
        setServings(recipeData.servings || 1);

        // Görseli oluştur
        generateRecipeImage(recipeData.title);
      }
    } catch (error) {
      console.error('Tarif oluşturma hatası:', error);
      Alert.alert('Hata', 'Tarif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
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
      console.error('Görsel oluşturma hatası:', error);
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
        <View style={styles.formContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Hızlı Tarif</Title>
              <Text style={styles.subtitle}>
                Zaman kısıtlamasına göre hızlı, pratik ve lezzetli tarifler
              </Text>

              <Title style={styles.subSectionTitle}>Pişirme Süresi (dk)</Title>
              <View style={styles.sliderContainer}>
                <Text style={styles.timeLabel}>5 dk</Text>
                <View style={styles.slider}>
                  <Slider
                    value={cookingTime}
                    minimumValue={5}
                    maximumValue={60}
                    step={5}
                    onValueChange={(value) => setCookingTime(value)}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.timeLabel}>60 dk</Text>
              </View>
              <Text style={styles.timeValue}>{cookingTime} dakika</Text>

              <Divider style={styles.divider} />

              <Title style={styles.subSectionTitle}>Zorluk Seviyesi</Title>
              <View style={styles.difficultiesContainer}>
                {DIFFICULTY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() => setDifficultyLevel(level.value)}
                    style={{ alignItems: 'center' }}
                  >
                    <Surface
                      style={[
                        styles.difficultyItem,
                        difficultyLevel === level.value ? 
                          { backgroundColor: level.color + '30', borderColor: level.color } : 
                          { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' }
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={level.icon}
                        size={24}
                        color={difficultyLevel === level.value ? level.color : '#757575'}
                      />
                    </Surface>
                    <Text style={{ 
                      marginTop: 4, 
                      color: difficultyLevel === level.value ? level.color : '#757575',
                      fontWeight: difficultyLevel === level.value ? 'bold' : 'normal'
                    }}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Divider style={styles.divider} />

              <Title style={styles.subSectionTitle}>Ekipman</Title>
              <RadioButton.Group
                onValueChange={(value) => setEquipmentType(value)}
                value={equipmentType}
              >
                {EQUIPMENT_OPTIONS.map((option) => (
                  <View key={option.value} style={styles.radioItem}>
                    <RadioButton value={option.value} />
                    <MaterialCommunityIcons name={option.icon} size={20} style={styles.radioIcon} />
                    <Text>{option.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>

              <Divider style={styles.divider} />

              <Title style={styles.subSectionTitle}>Öğün Tipi</Title>
              <View style={styles.mealTypesContainer}>
                {MEAL_TYPES.map((type) => (
                  <Chip
                    key={type.value}
                    icon={type.icon}
                    selected={mealType === type.value}
                    onPress={() => setMealType(mealType === type.value ? '' : type.value)}
                    style={[
                      styles.mealChip,
                      mealType === type.value ? styles.selectedMealChip : {}
                    ]}
                  >
                    {type.label}
                  </Chip>
                ))}
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
                onPress={generateQuickRecipe}
                style={styles.generateButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Hızlı Tarif Oluştur
              </Button>
            </Card.Content>
          </Card>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Hızlı tarif oluşturuluyor...</Text>
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

                  <View style={styles.timeComparisonContainer}>
                    <Text style={styles.timeComparisonText}>
                      Toplam Süre: {prepTime + cookTime} dakika
                      {prepTime + cookTime <= cookingTime ? (
                        <Text style={styles.timeSuccess}> ✓ {cookingTime} dakika sınırına uygun</Text>
                      ) : (
                        <Text style={styles.timeWarning}> ⚠️ {cookingTime} dakika sınırını aşıyor</Text>
                      )}
                    </Text>
                  </View>

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
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#757575',
  },
  timeValue: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  difficultiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  difficultyItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioIcon: {
    marginRight: 8,
  },
  mealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  mealChip: {
    margin: 4,
  },
  selectedMealChip: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
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
  timeComparisonContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeComparisonText: {
    fontSize: 14,
  },
  timeSuccess: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  timeWarning: {
    color: '#F44336',
    fontWeight: 'bold',
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

export default QuickRecipeScreen;