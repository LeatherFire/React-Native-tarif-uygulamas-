// src/constants/cuisines.ts
export interface Cuisine {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  popularDishes: string[];
}

export const CUISINES: Cuisine[] = [
  {
    id: 'turkish',
    name: 'Türk Mutfağı',
    icon: 'food-turkey',
    color: '#E74C3C',
    description: "Anadolu'nun zengin tarihi ve çeşitli bölgesel lezzetlerini yansıtan geleneksel Türk mutfağı",
    popularDishes: ['Kebap', 'Mantı', 'Dolma', 'Baklava', 'Köfte', 'İmam Bayıldı']
  },
  {
    id: 'italian',
    name: 'İtalyan Mutfağı',
    icon: 'pasta',
    color: '#27AE60',
    description: 'Makarna, pizza, risotto ve zengin peynirlerle tanınan İtalyan mutfağı',
    popularDishes: ['Pizza', 'Makarna', 'Risotto', 'Lazanya', 'Tiramisu', 'Panna Cotta']
  },
  {
    id: 'chinese',
    name: 'Çin Mutfağı',
    icon: 'noodles',
    color: '#F39C12',
    description: 'Çeşitli baharatlar, erişte, pirinç ve wok pişirme teknikleriyle ünlü Çin mutfağı',
    popularDishes: ['Chow Mein', 'Sweet and Sour Chicken', 'Pekin Ördeği', 'Dim Sum', 'Wonton Çorbası']
  },
  {
    id: 'japanese',
    name: 'Japon Mutfağı',
    icon: 'fish',
    color: '#9B59B6',
    description: 'Sushi, sashimi, ramen ve tempura gibi lezzetleriyle ünlü Japon mutfağı',
    popularDishes: ['Sushi', 'Ramen', 'Tempura', 'Udon', 'Sashimi', 'Miso Çorbası']
  },
  {
    id: 'indian',
    name: 'Hint Mutfağı',
    icon: 'shaker-outline',
    color: '#F1C40F',
    description: 'Zengin baharatlar, köri sosları ve çeşitli vejetaryen seçenekleriyle ünlü Hint mutfağı',
    popularDishes: ['Köri', 'Chicken Tikka Masala', 'Samosa', 'Biryani', 'Naan Ekmeği', 'Dal']
  },
  {
    id: 'mexican',
    name: 'Meksika Mutfağı',
    icon: 'taco',
    color: '#3498DB',
    description: 'Acı soslar, tortilla, fasulye ve avokado içeren Meksika mutfağı',
    popularDishes: ['Taco', 'Burrito', 'Nachos', 'Guacamole', 'Chili con Carne', 'Quesadilla']
  },
  {
    id: 'french',
    name: 'Fransız Mutfağı',
    icon: 'chef-hat',
    color: '#34495E',
    description: 'Sofistike pişirme teknikleri ve zengin soslarıyla bilinen Fransız mutfağı',
    popularDishes: ['Coq au Vin', 'Boeuf Bourguignon', 'Ratatouille', 'Quiche', 'Crème Brûlée', 'Croissant']
  },
  {
    id: 'greek',
    name: 'Yunan Mutfağı',
    icon: 'food-drumstick',
    color: '#2980B9',
    description: 'Zeytinyağı, otlar, peynirler ve deniz mahsulleriyle meşhur Yunan mutfağı',
    popularDishes: ['Moussaka', 'Gyros', 'Souvlaki', 'Tzatziki', 'Baklava', 'Dolma']
  },
  {
    id: 'spanish',
    name: 'İspanyol Mutfağı',
    icon: 'food-variant',
    color: '#C0392B',
    description: 'Tapas, paella ve çeşitli deniz mahsulleri yemekleriyle tanınan İspanyol mutfağı',
    popularDishes: ['Paella', 'Tapas', 'Gazpacho', 'Tortilla Española', 'Churros', 'Jamón Ibérico']
  },
  {
    id: 'thai',
    name: 'Tayland Mutfağı',
    icon: 'rice',
    color: '#16A085',
    description: 'Tatlı, ekşi, tuzlu ve acı tatların dengesiyle bilinen Tayland mutfağı',
    popularDishes: ['Pad Thai', 'Green Curry', 'Tom Yum Çorbası', 'Som Tam (Papaya Salatası)', 'Mango Sticky Rice']
  },
  {
    id: 'lebanese',
    name: 'Lübnan Mutfağı',
    icon: 'food-steak',
    color: '#D35400',
    description: 'Mezeler, tahinli yemekler ve taze otlarla zenginleştirilmiş Lübnan mutfağı',
    popularDishes: ['Hummus', 'Falafel', 'Tabbouleh', 'Shawarma', 'Fattoush', 'Kibbeh']
  },
  {
    id: 'korean',
    name: 'Kore Mutfağı',
    icon: 'bowl-mix',
    color: '#8E44AD',
    description: 'Fermente gıdalar, baharatlı soslar ve ızgara etleriyle tanınan Kore mutfağı',
    popularDishes: ['Kimchi', 'Bulgogi', 'Bibimbap', 'Japchae', 'Tteokbokki', 'Korean Fried Chicken']
  }
];