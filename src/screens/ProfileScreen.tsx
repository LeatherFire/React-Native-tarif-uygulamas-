import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { Text, Card, Divider, Button, IconButton, Avatar, List, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecipeStore } from '../store/recipeStore';
import { useThemeStore } from '../store/themeStore';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Örnek kullanıcı profil tipi
interface UserProfile {
  name: string;
  email: string;
  profileImage: string | null;
  joinDate: string;
}

const ProfileScreen = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { recipes, favoriteIds } = useRecipeStore();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Kullanıcı',
    email: 'kullanici@example.com',
    profileImage: null,
    joinDate: new Date().toLocaleDateString('tr-TR')
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Kullanıcı profil bilgilerini yükle
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error('Profil bilgileri yüklenemedi:', error);
      }
    };
    
    loadProfile();
  }, []);
  
  // Profil fotoğrafı seçme
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Görüntü seçmek için izin gerekiyor!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      const newProfile = { ...userProfile, profileImage: result.assets[0].uri };
      setUserProfile(newProfile);
      
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      } catch (error) {
        console.error('Profil resmi kaydedilemedi:', error);
      }
    }
  };
  
  // Profil bilgilerini kaydetme
  const saveProfile = async (name: string, email: string) => {
    const newProfile = { ...userProfile, name, email };
    setUserProfile(newProfile);
    setIsEditingProfile(false);
    
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
      console.error('Profil bilgileri kaydedilemedi:', error);
    }
  };
  
  // Ayar değişikliklerini kaydetme
  const saveSettings = async (setting: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(setting, JSON.stringify(value));
    } catch (error) {
      console.error('Ayar kaydedilemedi:', error);
    }
  };
  
  // Bildirim ayarı değiştirildiğinde
  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings('notifications', value);
  };
  
  // Otomatik kaydetme ayarı değiştirildiğinde
  const toggleAutoSave = (value: boolean) => {
    setAutoSaveEnabled(value);
    saveSettings('autoSave', value);
  };
  
  // İstatistikler
  const createdRecipesCount = recipes.length;
  const favoriteRecipesCount = favoriteIds.length;
  const totalCookingTime = recipes.reduce((total, recipe) => total + recipe.cookTime, 0);
  const totalPrepTime = recipes.reduce((total, recipe) => total + recipe.prepTime, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Kullanıcı Profil Kartı */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            {userProfile.profileImage ? (
              <Avatar.Image
                size={90}
                source={{ uri: userProfile.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Icon
                size={90}
                icon="account"
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              />
            )}
            <View style={styles.editAvatarButton}>
              <MaterialCommunityIcons name="camera" size={18} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
            <Text style={styles.joinDate}>Katılım: {userProfile.joinDate}</Text>
          </View>
          
          <IconButton
            icon="account-edit"
            size={24}
            onPress={() => setIsEditingProfile(!isEditingProfile)}
            style={styles.editButton}
          />
        </View>
        
        {isEditingProfile && (
          <Card style={styles.editProfileCard}>
            <Card.Content>
              <Text style={styles.editTitle}>Profil Bilgilerini Düzenle</Text>
              <List.Item
                title="Ad Soyad"
                description="Görünen adınızı değiştirin"
                left={props => <List.Icon {...props} icon="account" />}
                right={props => <Button {...props} mode="contained" onPress={() => saveProfile('Yeni İsim', userProfile.email)}>Değiştir</Button>}
              />
              <List.Item
                title="E-posta"
                description="E-posta adresinizi güncelleyin"
                left={props => <List.Icon {...props} icon="email" />}
                right={props => <Button {...props} mode="contained" onPress={() => saveProfile(userProfile.name, 'yeni@mail.com')}>Değiştir</Button>}
              />
            </Card.Content>
          </Card>
        )}
      </Card>
      
      {/* İstatistikler Kartı */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{createdRecipesCount}</Text>
              <Text style={styles.statLabel}>Tarif</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favoriteRecipesCount}</Text>
              <Text style={styles.statLabel}>Favori</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCookingTime}</Text>
              <Text style={styles.statLabel}>Pişirme (dk)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalPrepTime}</Text>
              <Text style={styles.statLabel}>Hazırlama (dk)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Aktivite Kartı */}
      <Card style={styles.activityCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.activityList}>
            {recipes.slice(0, 3).map((recipe, index) => (
              <View key={index} style={styles.activityItem}>
                <MaterialCommunityIcons name="book-open" size={20} color={theme.colors.primary} />
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>{recipe.title}</Text> tarifini oluşturdunuz
                </Text>
                <Chip size={20} style={styles.timeChip}>Bugün</Chip>
              </View>
            ))}
            
            {favoriteIds.length > 0 && (
              <View style={styles.activityItem}>
                <MaterialCommunityIcons name="heart" size={20} color={theme.colors.primary} />
                <Text style={styles.activityText}>
                  <Text style={styles.bold}>{recipes.find(r => r.id === favoriteIds[0])?.title}</Text> tarifini favorilere eklediniz
                </Text>
                <Chip size={20} style={styles.timeChip}>Dün</Chip>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
      
      {/* Ayarlar Kartı */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
          
          <List.Item
            title="Karanlık Mod"
            description="Uygulama temasını değiştir"
            left={props => <List.Icon {...props} icon={isDarkMode ? "weather-night" : "white-balance-sunny"} />}
            right={props => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Bildirimler"
            description="Yeni tarif önerileri al"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={props => <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Otomatik Kaydet"
            description="Tarif düzenlemelerini otomatik kaydet"
            left={props => <List.Icon {...props} icon="content-save-outline" />}
            right={props => <Switch value={autoSaveEnabled} onValueChange={toggleAutoSave} />}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Veri ve Gizlilik"
            description="Kişisel verilerinizi yönetin"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <IconButton {...props} icon="chevron-right" onPress={() => {}} />}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Hakkında"
            description="Uygulama versiyonu ve bilgileri"
            left={props => <List.Icon {...props} icon="information-outline" />}
            right={props => <IconButton {...props} icon="chevron-right" onPress={() => {}} />}
          />
        </Card.Content>
      </Card>
      
      {/* Destek ve Geri Bildirim */}
      <Card style={styles.supportCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Destek ve Geri Bildirim</Text>
          
          <View style={styles.supportButtons}>
            <Button
              mode="outlined"
              icon="email-outline"
              style={[styles.supportButton, { borderColor: theme.colors.primary }]}
              onPress={() => Linking.openURL('mailto:support@tarifapp.com')}
            >
              Bize Ulaşın
            </Button>
            
            <Button
              mode="outlined"
              icon="star-outline"
              style={[styles.supportButton, { borderColor: theme.colors.primary }]}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('itms-apps://itunes.apple.com/app/idXXXXXXXXX?action=write-review');
                } else {
                  Linking.openURL('market://details?id=com.yourcompany.tarifapp&showAllReviews=true');
                }
              }}
            >
              Değerlendir
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Oturum Kapatma Butonu */}
      <Button
        mode="outlined"
        icon="logout"
        style={styles.logoutButton}
        onPress={() => {
          // Oturum kapatma işlemi
          alert('Çıkış yapıldı');
        }}
      >
        Çıkış Yap
      </Button>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tarif Uygulaması v1.0.0</Text>
        <Text style={styles.footerText}>Tüm Hakları Saklıdır © 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  joinDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  editButton: {
    margin: 0,
  },
  editProfileCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  activityCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  settingsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  supportCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  timeChip: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  divider: {
    marginVertical: 4,
  },
  supportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  logoutButton: {
    marginVertical: 16,
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
    marginVertical: 2,
  },
});

export default ProfileScreen;