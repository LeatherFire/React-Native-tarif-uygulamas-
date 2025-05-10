// src/screens/RecipeOptionsScreen.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card, Text, Button, Title, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RecipeOptionsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface OptionCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  accentColor?: string;
}

const OptionCard = ({ title, description, icon, onPress, accentColor }: OptionCardProps) => {
  const theme = useTheme();
  const cardColor = accentColor || theme.colors.primary;
  
  return (
    <Card style={[styles.card, { borderLeftColor: cardColor, borderLeftWidth: 4 }]} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
          <MaterialCommunityIcons name={icon} size={36} color={cardColor} />
        </View>
        <View style={styles.textContainer}>
          <Title style={styles.cardTitle}>{title}</Title>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const RecipeOptionsScreen = () => {
  const navigation = useNavigation<RecipeOptionsScreenNavigationProp>();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Nasıl bir tarif oluşturmak istersiniz?</Text>
      
      <ScrollView style={styles.scrollView}>
        <OptionCard
          title="Klasik Tarif"
          description="AI yardımıyla istediğiniz tarifi oluşturun"
          icon="chef-hat"
          accentColor="#FF6B6B"
          onPress={() => navigation.navigate('CreateRecipe')}
        />
        
        <OptionCard
          title="Beslenme Odaklı"
          description="Protein, karbonhidrat, yağ ve kalori değerlerini içeren tarifler"
          icon="nutrition"
          accentColor="#4CAF50"
          onPress={() => navigation.navigate('NutritionRecipe')}
        />
        
        <OptionCard
          title="Eldeki Malzemeler"
          description="Mevcut malzemelerinizle yapabileceğiniz tarifler"
          icon="food-variant"
          accentColor="#2196F3"
          onPress={() => navigation.navigate('IngredientBasedRecipe')}
        />
        
        <OptionCard
          title="Hızlı Tarifler"
          description="Kısıtlı zamanınız için hızlı ve pratik tarifler"
          icon="clock-fast"
          accentColor="#FFC107"
          onPress={() => navigation.navigate('QuickRecipe')}
        />
        
        <OptionCard
          title="Dünya Mutfakları"
          description="Farklı ülkelerin mutfaklarından lezzetli tarifler"
          icon="earth"
          accentColor="#9C27B0"
          onPress={() => navigation.navigate('WorldCuisineRecipe')}
        />
      </ScrollView>
      
      <Button 
        mode="outlined" 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        İptal
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  cancelButton: {
    marginTop: 20,
    marginBottom: 16,
  },
});

export default RecipeOptionsScreen;