import fs from 'fs';
import path from 'path';
import {
  Category,
  Product,
  Banner,
  Address,
  Order,
  Coupon,
  StoreSettings,
  Recipe,
  InventoryMovement,
  CustomerProfile,
  DeliveryBoyProfile,
  OrderStatus,
  OrderItem
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  banners: Banner[];
  addresses: Address[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  recipes: Recipe[];
  inventoryMovements: InventoryMovement[];
  customers: CustomerProfile[];
  deliveryBoys: DeliveryBoyProfile[];
}

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Cooking Oil', slug: 'cooking-oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80', displayOrder: 1, isActive: true },
  { id: 'cat-2', name: 'Biscuits', slug: 'biscuits', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80', displayOrder: 2, isActive: true },
  { id: 'cat-3', name: 'Soap', slug: 'soap', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&auto=format&fit=crop&q=80', displayOrder: 3, isActive: true },
  { id: 'cat-4', name: 'Detergent & Washing Powder', slug: 'detergent-washing-powder', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=80', displayOrder: 4, isActive: true },
  { id: 'cat-5', name: 'Shampoo & Personal Care', slug: 'shampoo-personal-care', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80', displayOrder: 5, isActive: true },
  { id: 'cat-6', name: 'Rice', slug: 'rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80', displayOrder: 6, isActive: true },
  { id: 'cat-7', name: 'Wheat Flour & Atta', slug: 'wheat-flour-atta', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', displayOrder: 7, isActive: true },
  { id: 'cat-8', name: 'Pulses & Dal', slug: 'pulses-dal', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', displayOrder: 8, isActive: true },
  { id: 'cat-9', name: 'Spices & Masala', slug: 'spices-masala', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80', displayOrder: 9, isActive: true },
  { id: 'cat-10', name: 'Chips & Namkeen', slug: 'chips-namkeen', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80', displayOrder: 10, isActive: true },
  { id: 'cat-11', name: 'Chocolates & Candies', slug: 'chocolates-candies', image: 'https://images.unsplash.com/photo-1548741487-18d16a145e80?w=500&auto=format&fit=crop&q=80', displayOrder: 11, isActive: true },
  { id: 'cat-12', name: 'Cakes & Bakery Products', slug: 'cakes-bakery-products', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80', displayOrder: 12, isActive: true },
  { id: 'cat-13', name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80', displayOrder: 13, isActive: true },
  { id: 'cat-14', name: 'Eggs', slug: 'eggs', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80', displayOrder: 14, isActive: true },
  { id: 'cat-15', name: 'Dairy Products', slug: 'dairy-products', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80', displayOrder: 15, isActive: true },
  { id: 'cat-16', name: 'Tea & Coffee', slug: 'tea-coffee', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80', displayOrder: 16, isActive: true },
  { id: 'cat-17', name: 'Sugar & Salt', slug: 'sugar-salt', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80', displayOrder: 17, isActive: true },
  { id: 'cat-18', name: 'Household Cleaning', slug: 'household-cleaning', image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80', displayOrder: 18, isActive: true },
  { id: 'cat-19', name: 'Stationery', slug: 'stationery', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80', displayOrder: 19, isActive: true },
  { id: 'cat-20', name: 'Other Grocery Products', slug: 'other-grocery-products', image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80', displayOrder: 20, isActive: true },
  { id: 'cat-21', name: 'Health & Daily Essentials', slug: 'health-daily-essentials', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80', displayOrder: 21, isActive: true }
];

const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    categoryId: 'cat-1',
    categoryName: 'Cooking Oil',
    weight: '1 L Pouch',
    mrp: 175,
    sellingPrice: 142,
    discountPercentage: 19,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    description: 'Enriched with Vitamin A and D, lightweight and heart-healthy refined sunflower oil perfect for daily Indian cooking and frying.',
    ingredients: '100% Pure Refined Sunflower Seed Oil, Added Vitamins A & D',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Dhara Mustard Oil Kachi Ghani',
    brand: 'Dhara',
    categoryId: 'cat-1',
    categoryName: 'Cooking Oil',
    weight: '1 L Bottle',
    mrp: 190,
    sellingPrice: 158,
    discountPercentage: 17,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional cold pressed pungent aroma mustard oil for authentic Indian curries, pickles, and tadka.',
    ingredients: '100% Pure Cold-Pressed Mustard Oil',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Parle-G Gold Original Glucose Biscuits',
    brand: 'Parle',
    categoryId: 'cat-2',
    categoryName: 'Biscuits',
    weight: '1 kg Pack',
    mrp: 120,
    sellingPrice: 99,
    discountPercentage: 18,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80',
    description: 'The golden goodness of wheat and milk goodness. India’s favorite tea-time companion for generations.',
    ingredients: 'Wheat Flour (65%), Sugar, Edible Vegetable Oil, Invert Sugar Syrup, Milk Solids',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Britannia Good Day Butter Cookies',
    brand: 'Britannia',
    categoryId: 'cat-2',
    categoryName: 'Biscuits',
    weight: '600 g (Buy 5 Get 1 Free)',
    mrp: 150,
    sellingPrice: 120,
    discountPercentage: 20,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=80',
    description: 'Rich, buttery aroma and crunchy texture that brings a smile with every bite.',
    ingredients: 'Refined Wheat Flour, Butter, Sugar, Cashew Bits, Milk Solids',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Dettol Original Germ Protection Bathing Soap',
    brand: 'Dettol',
    categoryId: 'cat-3',
    categoryName: 'Soap',
    weight: '125 g x 4 + 1 Free Pack',
    mrp: 295,
    sellingPrice: 229,
    discountPercentage: 22,
    stock: 62,
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&auto=format&fit=crop&q=80',
    description: 'Trusted 99.9% germ protection soap bar enriched with skin moisturizers and classic pine fragrance.',
    ingredients: 'Sodium Palmate, Pine Oil, Glycerin, Chloroxylenol',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Dove Cream Beauty Bathing Bar',
    brand: 'Dove',
    categoryId: 'cat-3',
    categoryName: 'Soap',
    weight: '100 g x 3 Pack',
    mrp: 240,
    sellingPrice: 198,
    discountPercentage: 17,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1607006411601-775c8cc632dc?w=500&auto=format&fit=crop&q=80',
    description: 'Contains 1/4th moisturizing cream for soft, smooth and glowing skin.',
    ingredients: 'Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid',
    isFeatured: false,
    isBestSeller: false,
    isSuperDeal: false,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Surf Excel Easy Wash Detergent Powder',
    brand: 'Surf Excel',
    categoryId: 'cat-4',
    categoryName: 'Detergent & Washing Powder',
    weight: '3 kg Pack',
    mrp: 460,
    sellingPrice: 385,
    discountPercentage: 16,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500&auto=format&fit=crop&q=80',
    description: 'Removes tough stains easily like oil, curry, mud and ketchup in 1 wash without scrubbing.',
    ingredients: 'Enzymes, Optical Brighteners, Surfactants, Fragrance',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Aashirvaad Superior MP Sharbati Atta',
    brand: 'Aashirvaad',
    categoryId: 'cat-7',
    categoryName: 'Wheat Flour & Atta',
    weight: '10 kg Bag',
    mrp: 520,
    sellingPrice: 449,
    discountPercentage: 14,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    description: '100% pure whole wheat grain flour made from high quality Sehore grain for softer and fluffy rotis.',
    ingredients: '100% Whole Wheat Grain Flour',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'India Gate Basmati Rice Feast Rozzana',
    brand: 'India Gate',
    categoryId: 'cat-6',
    categoryName: 'Rice',
    weight: '5 kg Bag',
    mrp: 495,
    sellingPrice: 399,
    discountPercentage: 19,
    stock: 42,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    description: 'Long grain, aromatic aged Basmati rice ideal for daily biryani, pulao and steamed rice.',
    ingredients: 'Aged Basmati Rice Grains',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-10',
    name: 'Tata Sampann Unpolished Toor Dal',
    brand: 'Tata Sampann',
    categoryId: 'cat-8',
    categoryName: 'Pulses & Dal',
    weight: '1 kg Pouch',
    mrp: 195,
    sellingPrice: 165,
    discountPercentage: 15,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    description: 'Unpolished split pigeon peas naturally rich in protein and dietary fiber for homestyle dal tadka.',
    ingredients: 'Unpolished Arhar / Toor Dal',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-11',
    name: 'Catch Super Garam Masala Powder',
    brand: 'Catch',
    categoryId: 'cat-9',
    categoryName: 'Spices & Masala',
    weight: '100 g Box',
    mrp: 95,
    sellingPrice: 79,
    discountPercentage: 17,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
    description: 'Authentic blend of aromatic Indian spices made with low temperature grinding technology.',
    ingredients: 'Coriander, Cumin, Cardamom, Cinnamon, Cloves, Black Pepper, Nutmeg',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-12',
    name: 'Lay’s India’s Magic Masala Potato Chips',
    brand: 'Lay’s',
    categoryId: 'cat-10',
    categoryName: 'Chips & Namkeen',
    weight: '115 g Party Pack',
    mrp: 50,
    sellingPrice: 42,
    discountPercentage: 16,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy sliced fresh potatoes sprinkled with tantalizing spicy Indian seasoning.',
    ingredients: 'Potatoes, Edible Vegetable Oil, Mixed Spices (Chilli, Onion, Garlic, Dry Mango)',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-13',
    name: 'Cadbury Dairy Milk Silk Chocolate',
    brand: 'Cadbury',
    categoryId: 'cat-11',
    categoryName: 'Chocolates & Candies',
    weight: '150 g Bar',
    mrp: 175,
    sellingPrice: 145,
    discountPercentage: 17,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1548741487-18d16a145e80?w=500&auto=format&fit=crop&q=80',
    description: 'Smoother, creamier, and velvetier chocolate bar that melts in your mouth.',
    ingredients: 'Sugar, Milk Solids (25%), Cocoa Butter, Cocoa Solids, Emulsifiers',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-14',
    name: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    categoryId: 'cat-15',
    categoryName: 'Dairy Products',
    weight: '1 L Tetra Pack',
    mrp: 74,
    sellingPrice: 68,
    discountPercentage: 8,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh UHT treated homogenized toned milk with no preservatives, long shelf life.',
    ingredients: 'Toned Milk, Fat 3.0% min, SNF 8.5% min',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-15',
    name: 'Amul Pasteurised Salted Butter',
    brand: 'Amul',
    categoryId: 'cat-15',
    categoryName: 'Dairy Products',
    weight: '500 g Carton',
    mrp: 275,
    sellingPrice: 259,
    discountPercentage: 6,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    description: 'The taste of India - delicious creamy butter made from pure milk fat.',
    ingredients: 'Butterfat 80%, Moisture 16%, Salt 3%',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-16',
    name: 'Fresh Farm Brown Eggs',
    brand: 'Eggoz',
    categoryId: 'cat-14',
    categoryName: 'Eggs',
    weight: '12 Pieces Pack',
    mrp: 140,
    sellingPrice: 115,
    discountPercentage: 18,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80',
    description: 'Nutritious farm fresh protein rich brown eggs with deep orange yolk, sanitized.',
    ingredients: '12 Clean Farm Hen Eggs',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-17',
    name: 'Tata Tea Gold Rich Assam Leaves',
    brand: 'Tata Tea',
    categoryId: 'cat-16',
    categoryName: 'Tea & Coffee',
    weight: '500 g Pouch',
    mrp: 320,
    sellingPrice: 269,
    discountPercentage: 16,
    stock: 58,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    description: 'Exquisite blend of fine Assam CTC tea leaves gently rolled with long leaves for heavenly aroma.',
    ingredients: '100% CTC Black Tea with Long Leaves',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-18',
    name: 'Nescafe Classic Instant Coffee Jar',
    brand: 'Nescafe',
    categoryId: 'cat-16',
    categoryName: 'Tea & Coffee',
    weight: '200 g Glass Jar',
    mrp: 410,
    sellingPrice: 349,
    discountPercentage: 15,
    stock: 38,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    description: '100% pure natural coffee made from selected Robusta beans roasted to perfection.',
    ingredients: 'Pure Roasted Coffee Beans Soluble Powder',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-19',
    name: 'Coca-Cola Zero Sugar Can',
    brand: 'Coca-Cola',
    categoryId: 'cat-13',
    categoryName: 'Cold Drinks & Juices',
    weight: '300 ml x 6 Can Pack',
    mrp: 240,
    sellingPrice: 199,
    discountPercentage: 17,
    stock: 48,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    description: 'Great Coca-Cola taste with zero calories and zero sugar. Served chilled.',
    ingredients: 'Carbonated Water, Acidity Regulators, Non-caloric Sweeteners, Caffeine',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-20',
    name: 'Tata Salt Vacuum Evaporated Iodised Salt',
    brand: 'Tata Salt',
    categoryId: 'cat-17',
    categoryName: 'Sugar & Salt',
    weight: '1 kg Pouch',
    mrp: 28,
    sellingPrice: 24,
    discountPercentage: 14,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    description: 'Desh Ka Namak. Pure vacuum evaporated iodised salt essential for mental development.',
    ingredients: 'Edible Common Salt, Potassium Iodate, Anti-caking Agent',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-21',
    name: 'Dabur Pure Honey Squeezy Bottle',
    brand: 'Dabur',
    categoryId: 'cat-21',
    categoryName: 'Health & Daily Essentials',
    weight: '400 g Squeezy',
    mrp: 235,
    sellingPrice: 189,
    discountPercentage: 20,
    stock: 52,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
    description: '100% pure honey sourced from Himalayas, NMR tested, rich in natural antioxidants.',
    ingredients: 'Pure Natural Honey',
    isFeatured: true,
    isBestSeller: true,
    isSuperDeal: true,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-22',
    name: 'Chyawanprash 2X Immunity Booster',
    brand: 'Dabur',
    categoryId: 'cat-21',
    categoryName: 'Health & Daily Essentials',
    weight: '950 g Jar',
    mrp: 395,
    sellingPrice: 320,
    discountPercentage: 19,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    description: 'Time-tested Ayurvedic formulation with Amla and over 40 potent herbs for everyday vitality.',
    ingredients: 'Amla, Ashwagandha, Pippali, Shatavari, Pure Ghee, Honey',
    isFeatured: true,
    isBestSeller: false,
    isSuperDeal: false,
    isHealthEssential: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-23',
    name: 'Classmate Pulse A4 Spiral Notebook',
    brand: 'Classmate',
    categoryId: 'cat-19',
    categoryName: 'Stationery',
    weight: '300 Pages (Pack of 2)',
    mrp: 260,
    sellingPrice: 215,
    discountPercentage: 17,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80',
    description: 'Elemental chlorine-free paper notebook with micro-perforated pages and sturdy poly cover.',
    ingredients: 'Premium 70 GSM Paper',
    isFeatured: false,
    isBestSeller: false,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-24',
    name: 'Harpic Power Plus Disinfectant Toilet Cleaner',
    brand: 'Harpic',
    categoryId: 'cat-18',
    categoryName: 'Household Cleaning',
    weight: '1 L Original',
    mrp: 215,
    sellingPrice: 179,
    discountPercentage: 17,
    stock: 58,
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=500&auto=format&fit=crop&q=80',
    description: 'Kills 99.9% germs, removes stubborn yellow stains and leaves long-lasting fresh fragrance.',
    ingredients: 'Hydrochloric Acid 10.5%, Surfactant, Fragrance',
    isFeatured: false,
    isBestSeller: true,
    isSuperDeal: false,
    isHealthEssential: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultBanners: Banner[] = [
  {
    id: 'ban-1',
    title: '10-15 Mins Superfast Delivery',
    subtitle: 'Fresh groceries & daily needs at your doorstep',
    offerText: 'FLAT ₹100 OFF with code GROCE100',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Shop Super Deals',
    linkUrl: 'super-deals',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'ban-2',
    title: 'Daily Dairy, Bakery & Breakfast',
    subtitle: 'Farm fresh milk, butter, organic brown eggs & whole breads',
    offerText: 'UP TO 25% OFF Everyday',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Order Dairy & Eggs',
    linkUrl: 'category/cat-15',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'ban-3',
    title: 'Health & Daily Essentials Store',
    subtitle: 'Pure Honey, Chyawanprash, organic cold-pressed oils & care',
    offerText: 'EXTRA 20% OFF on Wellness',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'Explore Health Store',
    linkUrl: 'health-essentials',
    isActive: true,
    displayOrder: 3
  }
];

const defaultCoupons: Coupon[] = [
  {
    id: 'cp-1',
    code: 'GROCE100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 499,
    maxDiscount: 100,
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usedCount: 42,
    isActive: true,
    description: 'Flat ₹100 OFF on orders above ₹499'
  },
  {
    id: 'cp-2',
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 299,
    maxDiscount: 75,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    usedCount: 88,
    isActive: true,
    description: '15% instant discount (up to ₹75) on first 3 orders'
  },
  {
    id: 'cp-3',
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 25,
    minOrderValue: 199,
    maxDiscount: 25,
    expiryDate: '2027-12-31',
    usageLimit: 2000,
    usedCount: 130,
    isActive: true,
    description: 'Free delivery waiver on orders above ₹199'
  }
];

const defaultSettings: StoreSettings = {
  storeName: 'Quikzo',
  logo: '⚡ Quikzo',
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@quikzo.com',
  currencySymbol: '₹',
  deliveryCharge: 25,
  freeDeliveryThreshold: 499,
  taxPercentage: 5,
  codEnabled: true,
  onlinePaymentEnabled: true,
  storeOpen: true,
  estimatedDeliveryMinutes: '10-15 mins',
  serviceablePincodes: ['110001', '110002', '110003', '400001', '560001', '500001', '700001', '600001'],
  donationPaymentLink: ''
};

const defaultRecipes: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Rich Indian Masala Chai',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: 2,
    description: 'A steaming cup of classic Indian morning tea with milk, Assam CTC tea leaves, and aromatic cardamom & ginger.',
    ingredients: [
      { name: 'Tata Tea Gold CTC Leaves', quantity: '2 tbsp', productId: 'prod-17' },
      { name: 'Amul Taaza Toned Milk', quantity: '1 cup', productId: 'prod-14' },
      { name: 'Catch Super Garam Masala (Pinch)', quantity: '1 pinch', productId: 'prod-11' },
      { name: 'Sugar', quantity: '2 tsp' }
    ],
    instructions: [
      'Boil 1 cup of fresh water in a saucepan.',
      'Add crushed ginger and 2 tbsp Tata Tea Gold leaves. Simmer for 3 minutes.',
      'Pour in 1 cup of Amul Taaza milk and add sugar to taste.',
      'Bring to a rolling boil 3 times on medium flame.',
      'Strain through a fine sieve into kulhads or cups and serve hot!'
    ],
    isActive: true
  },
  {
    id: 'rec-2',
    title: 'Classic Fluffy Egg Omelette & Butter Toast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
    prepTime: '5 mins',
    cookTime: '5 mins',
    servings: 1,
    description: 'High-protein breakfast made with fresh brown eggs, chopped onions, and golden Amul butter.',
    ingredients: [
      { name: 'Fresh Farm Brown Eggs', quantity: '2 eggs', productId: 'prod-16' },
      { name: 'Amul Pasteurised Butter', quantity: '1 tbsp', productId: 'prod-15' },
      { name: 'Tata Salt', quantity: '1/2 tsp', productId: 'prod-20' }
    ],
    instructions: [
      'Crack 2 eggs into a bowl, add salt, a pinch of pepper, and whisk vigorously until frothy.',
      'Melt 1 tbsp Amul butter in a non-stick pan over medium heat.',
      'Pour the whisked eggs and tilt the pan to cover evenly.',
      'Cook for 2 minutes until bottom is golden, fold gently and serve with buttered toast.'
    ],
    isActive: true
  }
];

const defaultAddresses: Address[] = [
  {
    id: 'addr-1',
    userId: 'user-demo-1',
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    houseNumber: 'Flat 402, Block B, Green Heights',
    street: 'Outer Ring Road, Indiranagar',
    landmark: 'Near Metro Station Pillar 128',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    type: 'Home',
    isDefault: true
  }
];

const defaultCustomers: CustomerProfile[] = [
  {
    id: 'user-demo-1',
    phone: '9876543210',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'customer',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-1',
    phone: '9999999999',
    name: 'Store Administrator',
    email: 'admin@socialgrocery.com',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const defaultDeliveryBoys: DeliveryBoyProfile[] = [
  {
    id: 'dboy-1',
    name: 'Ramesh Kumar',
    username: 'ramesh_quikzo',
    email: 'ramesh@quikzo.com',
    phone: '9876501234',
    vehicleType: 'Bike',
    vehicleNumber: 'KA-01-EQ-9876',
    passwordHash: '94666b69d39fb5d47ec7f1ef6183845e6ab70f69b9513e0c409c1f8861a07f083e25dda859116b2ebda8582ffd6586cb64b66b1da7c7b3f7a8a98e159992c4c7',
    passwordSalt: 'quikzo_delivery_salt_123',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'dboy-2',
    name: 'Suresh Patel',
    username: 'suresh_rider',
    email: 'suresh@quikzo.com',
    phone: '9876505678',
    vehicleType: 'Electric Vehicle',
    vehicleNumber: 'KA-05-EV-4321',
    passwordHash: '94666b69d39fb5d47ec7f1ef6183845e6ab70f69b9513e0c409c1f8861a07f083e25dda859116b2ebda8582ffd6586cb64b66b1da7c7b3f7a8a98e159992c4c7',
    passwordSalt: 'quikzo_delivery_salt_123',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const defaultOrders: Order[] = [
  {
    id: 'GJ-ORD-1001',
    userId: 'user-demo-1',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    items: [
      {
        productId: 'prod-1',
        productName: 'Fortune Sunlite Refined Sunflower Oil',
        brand: 'Fortune',
        weight: '1 L Pouch',
        price: 142,
        mrp: 175,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
        itemTotal: 142
      },
      {
        productId: 'prod-16',
        productName: 'Fresh Farm Brown Eggs',
        brand: 'Eggoz',
        weight: '12 Pieces Pack',
        price: 115,
        mrp: 140,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80',
        itemTotal: 115
      },
      {
        productId: 'prod-14',
        productName: 'Amul Taaza Homogenised Toned Milk',
        brand: 'Amul',
        weight: '1 L Tetra Pack',
        price: 68,
        mrp: 74,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
        itemTotal: 136
      }
    ],
    subtotal: 393,
    discount: 0,
    deliveryCharge: 25,
    tax: 19,
    total: 437,
    status: 'Out for Delivery',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    deliveryAddress: defaultAddresses[0],
    estimatedDelivery: '10-15 mins',
    statusHistory: [
      { status: 'Pending', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), note: 'Order placed by customer' },
      { status: 'Confirmed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), note: 'Order accepted by Quikzo' },
      { status: 'Packed', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), note: 'Items packed in eco-friendly delivery bag' },
      { status: 'Out for Delivery', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), note: 'Delivery partner Suresh is on the way (8 mins away)' }
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const settings = parsed.settings || defaultSettings;
        if (settings.storeName?.includes('Social') || settings.storeName?.includes('GroceJo')) {
          settings.storeName = 'Quikzo';
          settings.logo = '⚡ Quikzo';
          settings.supportEmail = 'support@quikzo.com';
        }
        return {
          categories: parsed.categories?.length ? parsed.categories : defaultCategories,
          products: parsed.products?.length ? parsed.products : defaultProducts,
          banners: parsed.banners?.length ? parsed.banners : defaultBanners,
          addresses: parsed.addresses?.length ? parsed.addresses : defaultAddresses,
          orders: parsed.orders || defaultOrders,
          coupons: parsed.coupons?.length ? parsed.coupons : defaultCoupons,
          settings,
          recipes: parsed.recipes?.length ? parsed.recipes : defaultRecipes,
          inventoryMovements: parsed.inventoryMovements || [],
          customers: parsed.customers?.length ? parsed.customers : defaultCustomers,
          deliveryBoys: parsed.deliveryBoys?.length ? parsed.deliveryBoys : defaultDeliveryBoys
        };
      }
    } catch (err) {
      console.error('Error loading database file, falling back to defaults:', err);
    }

    const initialData: DatabaseSchema = {
      categories: defaultCategories,
      products: defaultProducts,
      banners: defaultBanners,
      addresses: defaultAddresses,
      orders: defaultOrders,
      coupons: defaultCoupons,
      settings: defaultSettings,
      recipes: defaultRecipes,
      inventoryMovements: [],
      customers: defaultCustomers,
      deliveryBoys: defaultDeliveryBoys
    };
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategory(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public createCategory(category: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`
    };
    this.data.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Products
  public getProducts(filter?: {
    categoryId?: string;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isSuperDeal?: boolean;
    isHealthEssential?: boolean;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'popularity' | 'newest';
  }): Product[] {
    let list = [...this.data.products];

    if (filter) {
      if (filter.categoryId) {
        list = list.filter(p => p.categoryId === filter.categoryId);
      }
      if (filter.isFeatured !== undefined) {
        list = list.filter(p => p.isFeatured === filter.isFeatured);
      }
      if (filter.isBestSeller !== undefined) {
        list = list.filter(p => p.isBestSeller === filter.isBestSeller);
      }
      if (filter.isSuperDeal !== undefined) {
        list = list.filter(p => p.isSuperDeal === filter.isSuperDeal);
      }
      if (filter.isHealthEssential !== undefined) {
        list = list.filter(p => p.isHealthEssential === filter.isHealthEssential);
      }
      if (filter.brand) {
        list = list.filter(p => p.brand.toLowerCase() === filter.brand!.toLowerCase());
      }
      if (filter.inStockOnly) {
        list = list.filter(p => p.stock > 0);
      }
      if (filter.minPrice !== undefined) {
        list = list.filter(p => p.sellingPrice >= filter.minPrice!);
      }
      if (filter.maxPrice !== undefined) {
        list = list.filter(p => p.sellingPrice <= filter.maxPrice!);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
        );
      }
      if (filter.sortBy) {
        if (filter.sortBy === 'price_asc') {
          list.sort((a, b) => a.sellingPrice - b.sellingPrice);
        } else if (filter.sortBy === 'price_desc') {
          list.sort((a, b) => b.sellingPrice - a.sellingPrice);
        } else if (filter.sortBy === 'newest') {
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (filter.sortBy === 'popularity') {
          list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        }
      }
    }

    return list;
  }

  public getProduct(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const category = this.data.categories.find(c => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      categoryName: category?.name || 'General',
      discountPercentage: productData.mrp > 0
        ? Math.max(0, Math.round(((productData.mrp - productData.sellingPrice) / productData.mrp) * 100))
        : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(newProduct);

    // Record inventory initial movement
    this.data.inventoryMovements.push({
      id: `inv-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'admin_restock',
      quantityChange: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      createdAt: new Date().toISOString()
    });

    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.products[idx];
    const newMrp = updates.mrp !== undefined ? updates.mrp : existing.mrp;
    const newSelling = updates.sellingPrice !== undefined ? updates.sellingPrice : existing.sellingPrice;
    const discountPercentage = newMrp > 0 ? Math.max(0, Math.round(((newMrp - newSelling) / newMrp) * 100)) : 0;

    // Track stock change if stock was adjusted
    if (updates.stock !== undefined && updates.stock !== existing.stock) {
      this.data.inventoryMovements.push({
        id: `inv-${Date.now()}`,
        productId: existing.id,
        productName: existing.name,
        type: 'admin_adjustment',
        quantityChange: updates.stock - existing.stock,
        previousStock: existing.stock,
        newStock: updates.stock,
        createdAt: new Date().toISOString()
      });
    }

    let categoryName = existing.categoryName;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const c = this.data.categories.find(cat => cat.id === updates.categoryId);
      if (c) categoryName = c.name;
    }

    this.data.products[idx] = {
      ...existing,
      ...updates,
      categoryName,
      discountPercentage,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Inventory adjustment
  public adjustStock(productId: string, quantityChange: number, reason: string): Product | null {
    const prod = this.getProduct(productId);
    if (!prod) return null;

    const previousStock = prod.stock;
    const newStock = Math.max(0, previousStock + quantityChange);
    prod.stock = newStock;
    prod.updatedAt = new Date().toISOString();

    this.data.inventoryMovements.push({
      id: `inv-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type: quantityChange >= 0 ? 'admin_restock' : 'admin_adjustment',
      quantityChange,
      previousStock,
      newStock,
      referenceId: reason,
      createdAt: new Date().toISOString()
    });

    this.save();
    return prod;
  }

  // Banners
  public getBanners(): Banner[] {
    return this.data.banners.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getAllBanners(): Banner[] {
    return this.data.banners.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public createBanner(banner: Omit<Banner, 'id'>): Banner {
    const newBanner: Banner = { ...banner, id: `ban-${Date.now()}` };
    this.data.banners.push(newBanner);
    this.save();
    return newBanner;
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner | null {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.save();
    return this.data.banners[idx];
  }

  public deleteBanner(id: string): boolean {
    const len = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.id !== id);
    if (this.data.banners.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // Recipes
  public getRecipes(): Recipe[] {
    return this.data.recipes.filter(r => r.isActive);
  }

  public getAllRecipes(): Recipe[] {
    return this.data.recipes;
  }

  public createRecipe(recipe: Omit<Recipe, 'id'>): Recipe {
    const newRecipe: Recipe = { ...recipe, id: `rec-${Date.now()}` };
    this.data.recipes.push(newRecipe);
    this.save();
    return newRecipe;
  }

  public updateRecipe(id: string, updates: Partial<Recipe>): Recipe | null {
    const idx = this.data.recipes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.recipes[idx] = { ...this.data.recipes[idx], ...updates };
    this.save();
    return this.data.recipes[idx];
  }

  public deleteRecipe(id: string): boolean {
    const len = this.data.recipes.length;
    this.data.recipes = this.data.recipes.filter(r => r.id !== id);
    if (this.data.recipes.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // Addresses
  public getAddresses(userId: string): Address[] {
    return this.data.addresses.filter(a => a.userId === userId);
  }

  public createAddress(addressData: Omit<Address, 'id'>): Address {
    if (addressData.isDefault) {
      // Clear previous default
      this.data.addresses.forEach(a => {
        if (a.userId === addressData.userId) a.isDefault = false;
      });
    }
    const newAddress: Address = { ...addressData, id: `addr-${Date.now()}` };
    this.data.addresses.push(newAddress);
    this.save();
    return newAddress;
  }

  public updateAddress(id: string, updates: Partial<Address>): Address | null {
    const idx = this.data.addresses.findIndex(a => a.id === id);
    if (idx === -1) return null;
    if (updates.isDefault) {
      const uId = this.data.addresses[idx].userId;
      this.data.addresses.forEach(a => {
        if (a.userId === uId) a.isDefault = false;
      });
    }
    this.data.addresses[idx] = { ...this.data.addresses[idx], ...updates };
    this.save();
    return this.data.addresses[idx];
  }

  public deleteAddress(id: string): boolean {
    const len = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter(a => a.id !== id);
    if (this.data.addresses.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons.filter(c => c.isActive);
  }

  public getAllCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const newCoupon: Coupon = { ...coupon, id: `cp-${Date.now()}`, usedCount: 0 };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  public deleteCoupon(id: string): boolean {
    const len = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    if (this.data.coupons.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired.' };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'This coupon has reached its maximum redemption limit.' };
    }

    if (subtotal < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, subtotal);
    } else {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied! You saved ₹${discount}`,
      coupon
    };
  }

  // Orders
  public getOrders(userId?: string): Order[] {
    let list = [...this.data.orders];
    if (userId) {
      list = list.filter(o => o.userId === userId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrder(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(orderRequest: {
    userId: string;
    customerName: string;
    customerPhone: string;
    items: { productId: string; quantity: number }[];
    couponCode?: string;
    deliveryAddress: Address;
    paymentMethod: 'Cash on Delivery' | 'Online Payment';
  }): { success: boolean; order?: Order; error?: string } {
    if (!orderRequest.items || orderRequest.items.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }

    // 1. Server-side price & stock validation
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of orderRequest.items) {
      const product = this.getProduct(item.productId);
      if (!product) {
        return { success: false, error: `Product ID ${item.productId} was not found.` };
      }
      if (!product.isActive) {
        return { success: false, error: `${product.name} is currently unavailable.` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        };
      }

      const itemTotal = product.sellingPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        weight: product.weight,
        price: product.sellingPrice,
        mrp: product.mrp,
        quantity: item.quantity,
        image: product.image,
        itemTotal
      });
    }

    // 2. Auto-service PIN code so delivery is always available
    const settings = this.getSettings();
    if (orderRequest.deliveryAddress?.pincode) {
      if (!settings.serviceablePincodes) settings.serviceablePincodes = [];
      if (!settings.serviceablePincodes.includes(orderRequest.deliveryAddress.pincode)) {
        settings.serviceablePincodes.push(orderRequest.deliveryAddress.pincode);
        this.save();
      }
    }

    // 3. Coupon calculation
    let discount = 0;
    if (orderRequest.couponCode) {
      const couponCheck = this.validateCoupon(orderRequest.couponCode, subtotal);
      if (couponCheck.valid) {
        discount = couponCheck.discount;
        // increment coupon usage
        const cIdx = this.data.coupons.findIndex(c => c.code.toUpperCase() === orderRequest.couponCode!.toUpperCase());
        if (cIdx !== -1) {
          this.data.coupons[cIdx].usedCount += 1;
        }
      }
    }

    // 4. Delivery & Tax
    const deliveryCharge = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryCharge;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * settings.taxPercentage) / 100);
    const finalTotal = taxableAmount + deliveryCharge + tax;

    // 5. Deduct inventory safely
    const orderId = `GJ-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    for (const item of orderItems) {
      const prod = this.getProduct(item.productId);
      if (prod) {
        const prev = prod.stock;
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updatedAt = new Date().toISOString();

        this.data.inventoryMovements.push({
          id: `inv-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          type: 'order_deduct',
          quantityChange: -item.quantity,
          previousStock: prev,
          newStock: prod.stock,
          referenceId: orderId,
          createdAt: new Date().toISOString()
        });
      }
    }

    // 6. Create order record
    const newOrder: Order = {
      id: orderId,
      userId: orderRequest.userId,
      customerName: orderRequest.customerName,
      customerPhone: orderRequest.customerPhone,
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge,
      tax,
      total: finalTotal,
      status: 'Pending',
      paymentMethod: orderRequest.paymentMethod,
      paymentStatus: orderRequest.paymentMethod === 'Online Payment' ? 'Paid' : 'Pending',
      deliveryAddress: orderRequest.deliveryAddress,
      couponCode: orderRequest.couponCode,
      estimatedDelivery: settings.estimatedDeliveryMinutes || '10-15 mins',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);

    // Also register or update customer record
    const existingCust = this.data.customers.find(c => c.phone === orderRequest.customerPhone || c.id === orderRequest.userId);
    if (!existingCust) {
      this.data.customers.push({
        id: orderRequest.userId,
        phone: orderRequest.customerPhone,
        name: orderRequest.customerName,
        role: 'customer',
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return { success: true, order: newOrder };
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Order | null {
    const order = this.getOrder(orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${newStatus}`
    });

    // If order is cancelled and was not cancelled before, restore stock!
    if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const prod = this.getProduct(item.productId);
        if (prod) {
          const prev = prod.stock;
          prod.stock += item.quantity;
          prod.updatedAt = new Date().toISOString();

          this.data.inventoryMovements.push({
            id: `inv-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productName: prod.name,
            type: 'order_cancel_restore',
            quantityChange: item.quantity,
            previousStock: prev,
            newStock: prod.stock,
            referenceId: order.id,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    this.save();
    return order;
  }

  // Inventory movements
  public getInventoryMovements(): InventoryMovement[] {
    return [...this.data.inventoryMovements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Customers
  public getCustomers(): CustomerProfile[] {
    return this.data.customers;
  }

  public findCustomerByEmail(email: string): CustomerProfile | undefined {
    const clean = email.toLowerCase().trim();
    return this.data.customers.find(c => c.email && c.email.toLowerCase().trim() === clean);
  }

  public findCustomerByPhone(phone: string): CustomerProfile | undefined {
    const clean = phone.replace(/\D/g, '');
    return this.data.customers.find(c => c.phone.replace(/\D/g, '') === clean);
  }

  public createCustomer(customer: Omit<CustomerProfile, 'id' | 'createdAt'>): CustomerProfile {
    const newCustomer: CustomerProfile = {
      ...customer,
      id: `user-${Date.now()}`,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.data.customers.push(newCustomer);
    this.save();
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<CustomerProfile>): CustomerProfile | undefined {
    const index = this.data.customers.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.data.customers[index] = {
      ...this.data.customers[index],
      ...updates
    };
    this.save();
    return this.data.customers[index];
  }

  // Store Settings
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // ----------------------------------------------------
  // DELIVERY BOY MANAGEMENT
  // ----------------------------------------------------
  public getDeliveryBoys(): DeliveryBoyProfile[] {
    return this.data.deliveryBoys || [];
  }

  public getDeliveryBoyById(id: string): DeliveryBoyProfile | undefined {
    return (this.data.deliveryBoys || []).find(d => d.id === id);
  }

  public findDeliveryBoyByUsernameOrEmail(identifier: string): DeliveryBoyProfile | undefined {
    const clean = identifier.toLowerCase().trim();
    return (this.data.deliveryBoys || []).find(
      d => d.username.toLowerCase() === clean || d.email.toLowerCase() === clean || d.phone === clean
    );
  }

  public createDeliveryBoy(data: Omit<DeliveryBoyProfile, 'id' | 'createdAt'>): DeliveryBoyProfile {
    if (!this.data.deliveryBoys) {
      this.data.deliveryBoys = [];
    }
    const newBoy: DeliveryBoyProfile = {
      ...data,
      id: `dboy-${Date.now()}`,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString()
    };
    this.data.deliveryBoys.push(newBoy);
    this.save();
    return newBoy;
  }

  public updateDeliveryBoy(id: string, updates: Partial<DeliveryBoyProfile>): DeliveryBoyProfile | undefined {
    if (!this.data.deliveryBoys) return undefined;
    const index = this.data.deliveryBoys.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    this.data.deliveryBoys[index] = {
      ...this.data.deliveryBoys[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.deliveryBoys[index];
  }

  public deleteDeliveryBoy(id: string): boolean {
    if (!this.data.deliveryBoys) return false;
    const initialLen = this.data.deliveryBoys.length;
    this.data.deliveryBoys = this.data.deliveryBoys.filter(d => d.id !== id);
    if (this.data.deliveryBoys.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ----------------------------------------------------
  // DELIVERY ORDERS WORKFLOW
  // ----------------------------------------------------
  public getOrdersForDeliveryBoy(deliveryBoyId: string): Order[] {
    return this.data.orders.filter(o => o.deliveryBoyId === deliveryBoyId);
  }

  public assignOrderToDeliveryBoy(orderId: string, deliveryBoyId: string): Order | undefined {
    const order = this.getOrder(orderId);
    if (!order) return undefined;
    const boy = this.getDeliveryBoyById(deliveryBoyId);
    if (!boy) return undefined;

    const now = new Date().toISOString();
    order.deliveryBoyId = boy.id;
    order.deliveryBoyName = boy.name;
    order.deliveryBoyPhone = boy.phone;
    order.assignedAt = now;
    order.status = 'Assigned';
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'Assigned',
      timestamp: now,
      note: `Delivery assigned to partner ${boy.name} (+91 ${boy.phone})`
    });

    this.save();
    return order;
  }

  public updateDeliveryOrderStatus(
    orderId: string,
    status: OrderStatus,
    note: string,
    deliveryBoyId: string
  ): Order | undefined {
    const order = this.getOrder(orderId);
    if (!order) return undefined;

    // Verify order is assigned to this delivery boy
    if (order.deliveryBoyId !== deliveryBoyId) {
      throw new Error('This order is not assigned to your account.');
    }

    const now = new Date().toISOString();
    order.status = status;
    order.updatedAt = now;

    if (status === 'Accepted') order.acceptedAt = now;
    if (status === 'Picked Up') order.pickedUpAt = now;
    if (status === 'Out for Delivery') order.dispatchedAt = now;
    if (status === 'Delivered') {
      order.deliveredAt = now;
      if (order.paymentMethod === 'Cash on Delivery') {
        order.paymentStatus = 'Paid';
        order.codCollectedAt = now;
        order.codCollectedBy = deliveryBoyId;
      }
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status,
      timestamp: now,
      note: note || `Order status updated to ${status} by delivery partner`
    });

    this.save();
    return order;
  }

  public collectOrderCash(orderId: string, deliveryBoyId: string): Order | undefined {
    const order = this.getOrder(orderId);
    if (!order || order.deliveryBoyId !== deliveryBoyId) return undefined;

    const now = new Date().toISOString();
    order.paymentStatus = 'Paid';
    order.codCollectedAt = now;
    order.codCollectedBy = deliveryBoyId;
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.status,
      timestamp: now,
      note: `Cash on Delivery (₹${order.total}) collected by delivery partner`
    });

    this.save();
    return order;
  }

  public reportDeliveryIssue(
    orderId: string,
    deliveryBoyId: string,
    reason: string,
    notes?: string
  ): Order | undefined {
    const order = this.getOrder(orderId);
    if (!order || order.deliveryBoyId !== deliveryBoyId) return undefined;

    const now = new Date().toISOString();
    order.status = 'Delivery Failed';
    order.deliveryIssue = {
      reason,
      notes,
      reportedAt: now
    };
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'Delivery Failed',
      timestamp: now,
      note: `Delivery Issue: ${reason}${notes ? ` - ${notes}` : ''}`
    });

    this.save();
    return order;
  }

  public getDeliveryReports() {
    const orders = this.data.orders;
    const boys = this.data.deliveryBoys || [];

    const totalAssigned = orders.filter(o => Boolean(o.deliveryBoyId)).length;
    const awaitingPickup = orders.filter(o => ['Assigned', 'Accepted', 'Ready for Pickup'].includes(o.status)).length;
    const outForDelivery = orders.filter(o => ['Picked Up', 'Out for Delivery'].includes(o.status)).length;
    const successfullyDelivered = orders.filter(o => o.status === 'Delivered').length;
    const failedDeliveries = orders.filter(o => ['Delivery Failed', 'Returned'].includes(o.status)).length;
    const totalCodCollected = orders
      .filter(o => o.paymentMethod === 'Cash on Delivery' && o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalAssigned,
      awaitingPickup,
      outForDelivery,
      successfullyDelivered,
      failedDeliveries,
      totalCodCollected,
      totalBoys: boys.length,
      activeBoys: boys.filter(b => b.isActive).length
    };
  }

  // Admin Dashboard summary stats
  public getDashboardStats() {
    const orders = this.data.orders;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Packed', 'Out for Delivery'].includes(o.status)).length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    const totalSales = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((acc, curr) => acc + curr.total, 0);

    const products = this.data.products;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10);
    const totalCustomers = this.data.customers.length;

    // Recent orders
    const recentOrders = orders.slice(0, 7);

    return {
      totalSales,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalProducts,
      totalCustomers,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders
    };
  }
}

export const db = new DatabaseService();
