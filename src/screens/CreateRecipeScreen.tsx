import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Image, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { fetchRecipe, RecipeData } from '../services/openaiService';
import { generateDishImage } from '../services/imageService';
import { useRecipeStore } from '../store/recipeStore';
import { Recipe } from '../constants/mockData';
import CategoryPicker from '../components/CategoryPicker';

type CreateRecipeNavigationProp = StackNavigationProp<RootStackParamList>;
type CreateRecipeRouteProp = RouteProp<RootStackParamList, 'CreateRecipe'>;

const CreateRecipeScreen = () => {
  const navigation = useNavigation<CreateRecipeNavigationProp>();
  const route = useRoute<CreateRecipeRouteProp>();
  
  // Düzenleme modu ve mevcut tarif bilgisi
  const editMode = route.params?.editMode || false;
  const existingRecipe = route.params?.recipe;
  
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animasyon için
  const [loadingText, setLoadingText] = useState('Tarifler pişiriliyor...');
  const [dots, setDots] = useState('');
  const bubbleAnimation1 = useRef(new Animated.Value(0)).current;
  const bubbleAnimation2 = useRef(new Animated.Value(0)).current;
  const bubbleAnimation3 = useRef(new Animated.Value(0)).current;
  const lidAnimation = useRef(new Animated.Value(0)).current;
  
  const { addOrUpdateRecipe } = useRecipeStore();
  
  // Kategori state'i
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('diger');

  // Düzenleme modunda ise mevcut tarif bilgilerini yükle
  useEffect(() => {
    if (editMode && existingRecipe) {
      setRecipe({
        title: existingRecipe.title,
        description: existingRecipe.description,
        prepTime: existingRecipe.prepTime,
        cookTime: existingRecipe.cookTime,
        servings: existingRecipe.servings,
        ingredients: existingRecipe.ingredients,
        instructions: existingRecipe.instructions
      });
      setImageUrl(existingRecipe.imageUrl);
      
      // Kategori bilgisini de yükle
      if (existingRecipe.categoryId) {
        setSelectedCategoryId(existingRecipe.categoryId);
      }
    }
  }, [editMode, existingRecipe]);
  
  // Animasyon efekti
  useEffect(() => {
    if (isLoading) {
      // Nokta animasyonu için zamanlayıcı
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setDots('.'.repeat(dotCount));
      }, 500);
      
      // Kabarcık animasyonu 1
      const animateBubble1 = () => {
        Animated.sequence([
          Animated.timing(bubbleAnimation1, {
            toValue: -40,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnimation1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]).start(() => animateBubble1());
      };
      
      // Kabarcık animasyonu 2
      const animateBubble2 = () => {
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(bubbleAnimation2, {
            toValue: -50,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnimation2, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]).start(() => animateBubble2());
      };
      
      // Kabarcık animasyonu 3
      const animateBubble3 = () => {
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(bubbleAnimation3, {
            toValue: -30,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnimation3, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ]).start(() => animateBubble3());
      };
      
      // Tencere kapağı animasyonu
      const animateLid = () => {
        Animated.sequence([
          Animated.timing(lidAnimation, {
            toValue: -5,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(lidAnimation, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          })
        ]).start(() => animateLid());
      };
      
      // Tüm animasyonları başlat
      animateBubble1();
      animateBubble2();
      animateBubble3();
      animateLid();
      
      // Yükleme metni rotasyonu
      const loadingTexts = [
        'Tarifler pişiriliyor',
        'Malzemeler karıştırılıyor',
        'Lezzetler harmanlaniyor',
        'Son dokunuşlar yapılıyor'
      ];
      
      let currentIndex = 0;
      const textInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[currentIndex]);
      }, 3000);
      
      return () => {
        clearInterval(dotsInterval);
        clearInterval(textInterval);
      };
    }
  }, [isLoading, bubbleAnimation1, bubbleAnimation2, bubbleAnimation3, lidAnimation]);
  
  const handleCreateRecipe = async () => {
    if (!prompt.trim()) {
      setError('Lütfen bir tarif açıklaması girin.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Tarif ve görsel oluşturma işlemlerini paralel başlat
      const recipePromise = fetchRecipe(prompt);
      
      // Tarif verisini bekle
      const recipeData = await recipePromise;
      
      // Görsel oluşturma işlemi başlat
      const imagePromise = generateDishImage(recipeData.title);
      
      // Her iki işlemin de tamamlanmasını bekle
      const imageUrl = await imagePromise;
      
      // Her iki işlem de tamamlandığında sonuçları göster
      setRecipe(recipeData);
      setImageUrl(imageUrl);
    } catch (err) {
      console.error('Tarif oluşturma hatası:', err);
      setError('Tarif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (title: string) => {
    setIsGeneratingImage(true);
    setError(null);

    try {
      const url = await generateDishImage(title);
      console.log('→ Oluşan görsel verisi alındı');
      setImageUrl(url);
    } catch (err: any) {
      console.error('Görsel oluşturma hatası:', err);
      setError('Görsel oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Tarifi kaydetme işlevi
  const handleSaveRecipe = async () => {
    if (!recipe) {
      setError('Tarif verisi bulunamadı.');
      return;
    }
    
    try {
      console.log('Kaydedilmeye çalışılan tarif:', JSON.stringify(recipe));
      
      // Tarif nesnesini hazırla
      const recipeToSave: Partial<Recipe> = {
        title: recipe.title,
        description: recipe.description,
        imageUrl: imageUrl || '',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        categoryId: selectedCategoryId
      };
      
      // Düzenleme modunda ise mevcut ID'yi kullan
      if (editMode && existingRecipe) {
        recipeToSave.id = existingRecipe.id;
      }
      
      // Tarifi kaydet/güncelle
      const savedRecipe = await addOrUpdateRecipe(recipeToSave);
      console.log('Başarıyla kaydedilen tarif:', savedRecipe.id);
      
      // Başarılı mesajı göster
      Alert.alert(
        "Başarılı",
        editMode ? "Tarif başarıyla güncellendi!" : "Tarif başarıyla kaydedildi!",
        [
          { text: "Tamam", onPress: () => navigation.goBack() }
        ]
      );
    } catch (err: any) {
      console.error('Tarif kaydetme hatası:', err);
      setError(`Tarif ${editMode ? 'güncellenirken' : 'kaydedilirken'} bir hata oluştu. Lütfen tekrar deneyin.`);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Yükleme Ekranı */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.cookingAnimation}>
            {/* Tencere gövdesi */}
            <View style={styles.pot}>
              {/* Kabarcıklar */}
              <Animated.View style={[styles.bubble, styles.bubble1, { transform: [{ translateY: bubbleAnimation1 }] }]}>
                <MaterialCommunityIcons name="circle" size={12} color="white" />
              </Animated.View>
              <Animated.View style={[styles.bubble, styles.bubble2, { transform: [{ translateY: bubbleAnimation2 }] }]}>
                <MaterialCommunityIcons name="circle" size={10} color="white" />
              </Animated.View>
              <Animated.View style={[styles.bubble, styles.bubble3, { transform: [{ translateY: bubbleAnimation3 }] }]}>
                <MaterialCommunityIcons name="circle" size={8} color="white" />
              </Animated.View>
              
              {/* Tencere içeriği */}
              <View style={styles.potContents} />
            </View>
            
            {/* Tencere kapağı */}
            <Animated.View style={[styles.potLid, { transform: [{ translateY: lidAnimation }] }]}>
              <View style={styles.potLidHandle} />
            </Animated.View>
            
            {/* Tencere kulpları */}
            <View style={[styles.potHandle, styles.potHandleLeft]} />
            <View style={[styles.potHandle, styles.potHandleRight]} />
          </View>
          
          <Text style={styles.loadingTextStyle}>
            {loadingText}{dots}
          </Text>
        </View>
      )}
      
      {/* Yeni Tarif Oluşturma / Tarif Düzenleme Formu */}
      {!isLoading && !editMode && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Yapay Zeka ile Tarif Oluştur</Text>
            <Text style={styles.description}>
              Ne tür bir yemek tarifi istediğinizi açıklayın. Örneğin: "Avokado ve
              kinoa içeren vejetaryen salata" veya "Çikolatalı ve fındıklı kurabiye".
            </Text>
            <TextInput
              mode="outlined"
              label="Tarif açıklaması"
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleCreateRecipe}
              loading={isLoading}
              disabled={isLoading || isGeneratingImage || !prompt.trim()}
              style={styles.button}
            >
              Tarif Oluştur
            </Button>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Card.Content>
        </Card>
      )}

      {/* Düzenleme modunda form başlığı */}
      {!isLoading && editMode && (
        <View style={styles.editHeader}>
          <Text style={styles.title}>Tarif Düzenle</Text>
          <Text style={styles.description}>
            Tarif bilgilerini güncelleyin ve kaydedin.
          </Text>
        </View>
      )}

      {/* Tarif ve Görsel */}
      {!isLoading && recipe && (
        <Card style={styles.recipeCard}>
          <Card.Content>
            {/* Tarif başlığı düzenleme */}
            <TextInput
              mode="outlined"
              label="Tarif Başlığı"
              value={recipe.title}
              onChangeText={(text) => setRecipe({...recipe, title: text})}
              style={[styles.input, { marginBottom: 10 }]}
            />
            
            {/* Tarif açıklaması düzenleme */}
            <TextInput
              mode="outlined"
              label="Tarif Açıklaması"
              value={recipe.description}
              onChangeText={(text) => setRecipe({...recipe, description: text})}
              multiline
              numberOfLines={2}
              style={[styles.input, { marginBottom: 16 }]}
            />

            {/* Görsel kısmı */}
            {isGeneratingImage ? (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#FF6B6B" />
                <Text>Görsel oluşturuluyor...</Text>
              </View>
            ) : imageUrl ? (
              <View>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.recipeImage}
                  onError={(e) => {
                    console.log('Image yükleme hatası:', e.nativeEvent.error);
                    setError('Görsel görüntülenirken bir sorun oluştu.');
                  }}
                />
                <Button 
                  mode="outlined" 
                  icon="refresh"
                  onPress={() => handleGenerateImage(recipe.title)}
                  style={styles.generateImageButton}
                >
                  Görseli Yenile
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => handleGenerateImage(recipe.title)}
                style={styles.generateImageButton}
              >
                Görsel Oluştur
              </Button>
            )}
            
            {/* Kategori seçici */}
            <CategoryPicker 
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
            
            {/* Meta bilgileri - düzenlenebilir alanlar */}
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Hazırlama:</Text>
                <TextInput
                  mode="outlined"
                  label="Dakika"
                  value={recipe.prepTime.toString()}
                  onChangeText={(text) => setRecipe({...recipe, prepTime: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Pişirme:</Text>
                <TextInput
                  mode="outlined"
                  label="Dakika"
                  value={recipe.cookTime.toString()}
                  onChangeText={(text) => setRecipe({...recipe, cookTime: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Porsiyon:</Text>
                <TextInput
                  mode="outlined"
                  label="Adet"
                  value={recipe.servings.toString()}
                  onChangeText={(text) => setRecipe({...recipe, servings: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            {/* Malzemeler - düzenlenebilir liste */}
            <Text style={styles.sectionTitle}>Malzemeler</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientEditItem}>
                <TextInput
                  mode="outlined"
                  value={ingredient}
                  onChangeText={(text) => {
                    const newIngredients = [...recipe.ingredients];
                    newIngredients[index] = text;
                    setRecipe({...recipe, ingredients: newIngredients});
                  }}
                  style={styles.ingredientInput}
                />
                <Button
                  icon="delete"
                  mode="text"
                  onPress={() => {
                    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
                    setRecipe({...recipe, ingredients: newIngredients});
                  }}
                  style={styles.deleteButton}
                />
              </View>
            ))}
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => {
                setRecipe({
                  ...recipe,
                  ingredients: [...recipe.ingredients, '']
                });
              }}
              style={styles.addButton}
            >
              Malzeme Ekle
            </Button>
            
            <Divider style={styles.divider} />
            
            {/* Hazırlanışı - düzenlenebilir liste */}
            <Text style={styles.sectionTitle}>Hazırlanışı</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionEditItem}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <TextInput
                  mode="outlined"
                  value={instruction}
                  onChangeText={(text) => {
                    const newInstructions = [...recipe.instructions];
                    newInstructions[index] = text;
                    setRecipe({...recipe, instructions: newInstructions});
                  }}
                  multiline
                  style={styles.instructionInput}
                />
                <Button
                  icon="delete"
                  mode="text"
                  onPress={() => {
                    const newInstructions = recipe.instructions.filter((_, i) => i !== index);
                    setRecipe({...recipe, instructions: newInstructions});
                  }}
                  style={styles.deleteButton}
                />
              </View>
            ))}
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => {
                setRecipe({
                  ...recipe,
                  instructions: [...recipe.instructions, '']
                });
              }}
              style={styles.addButton}
            >
              Adım Ekle
            </Button>
            
            {/* Kaydet butonu */}
            <Button 
              mode="contained" 
              onPress={handleSaveRecipe}
              style={[styles.button, { marginTop: 20 }]}
            >
              {editMode ? 'Değişiklikleri Kaydet' : 'Bu Tarifi Kaydet'}
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    color: '#757575',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#FF6B6B',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  cookingAnimation: {
    width: 200,
    height: 160,
    alignItems: 'center',
    position: 'relative',
  },
  pot: {
    width: 120,
    height: 80,
    backgroundColor: '#505050',
    borderRadius: 12,
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
  },
  potContents: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '75%',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  potLid: {
    width: 130,
    height: 20,
    backgroundColor: '#404040',
    borderRadius: 10,
    position: 'absolute',
    top: 60,
    zIndex: 5,
  },
  potLidHandle: {
    width: 30,
    height: 10,
    backgroundColor: '#303030',
    borderRadius: 5,
    position: 'absolute',
    top: -5,
    left: 50,
  },
  potHandle: {
    width: 15,
    height: 30,
    backgroundColor: '#404040',
    borderRadius: 10,
    position: 'absolute',
    bottom: 25,
  },
  potHandleLeft: {
    left: 45,
    transform: [{ rotate: '30deg' }],
  },
  potHandleRight: {
    right: 45,
    transform: [{ rotate: '-30deg' }],
  },
  bubble: {
    position: 'absolute',
    zIndex: 4,
  },
  bubble1: {
    bottom: 20,
    left: 30,
  },
  bubble2: {
    bottom: 20,
    left: 70,
  },
  bubble3: {
    bottom: 20,
    left: 50,
  },
  loadingTextStyle: {
    marginTop: 40,
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
  },
  recipeCard: {
    marginBottom: 16,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: '#757575',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageLoadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  generateImageButton: {
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientItem: {
    marginBottom: 6,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 25,
  },
  instructionText: {
    flex: 1,
  },
  editHeader: {
    padding: 16,
    marginBottom: 8,
  },
  smallInput: {
    height: 40,
    fontSize: 14,
    width: 80,
  },
  ingredientEditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 1,
    marginRight: 8,
  },
  instructionEditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionInput: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    width: 40,
    marginLeft: 4,
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default CreateRecipeScreen;