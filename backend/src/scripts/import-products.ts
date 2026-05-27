/**
 * Script per importare prodotti da Open Food Facts (API gratuita)
 * 
 * Open Food Facts è un database collaborativo di prodotti alimentari.
 * API: https://world.openfoodfacts.org/data
 * 
 * Uso:
 *   npx ts-node src/scripts/import-products.ts
 * 
 * Oppure aggiungi a package.json:
 *   "import:products": "ts-node src/scripts/import-products.ts"
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-assistant';

// Categorie italiane da importare
const ITALIAN_CATEGORIES = [
  'crackers',
  'gallette',
  'fette-biscottate',
  'pasta',
  'riso',
  'olio-extravergine-di-oliva',
  'passata-di-pomodoro',
  'tonno-in-scatola',
  'legumi-in-scatola',
  'formaggi',
  'prosciutto',
  'salumi',
  'biscotti',
  'cereali-per-colazione',
  'latte',
  'yogurt',
  'pane',
  'grissini',
  'taralli',
];

interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories_tags?: string[];
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  quantity?: string;
  image_url?: string;
  nutriscore_grade?: string;
}

interface Product {
  code: string;
  name: string;
  brand?: string;
  category: string;
  subcategories: string[];
  quantity?: string;
  nutrition?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fat?: number;
  };
  nutriscore?: string;
  imageUrl?: string;
  source: 'openfoodfacts';
  importedAt: Date;
}

/**
 * Fetch prodotti da Open Food Facts per categoria
 */
async function fetchProductsByCategory(category: string, page: number = 1, pageSize: number = 50): Promise<OpenFoodFactsProduct[]> {
  const url = `https://it.openfoodfacts.org/category/${category}.json?page=${page}&page_size=${pageSize}&fields=code,product_name,brands,categories_tags,nutriments,quantity,image_url,nutriscore_grade`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GroceryAssistant/1.0 (contact@example.com)',
      },
    });
    
    if (!response.ok) {
      console.warn(`⚠️  Errore fetch ${category}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.warn(`⚠️  Errore fetch ${category}:`, error);
    return [];
  }
}

/**
 * Converte prodotto Open Food Facts nel nostro formato
 */
function convertProduct(product: OpenFoodFactsProduct, category: string): Product | null {
  if (!product.product_name || product.product_name.trim() === '') {
    return null;
  }
  
  return {
    code: product.code,
    name: product.product_name.trim(),
    brand: product.brands?.split(',')[0]?.trim(),
    category: category,
    subcategories: product.categories_tags?.slice(0, 5) || [],
    quantity: product.quantity,
    nutrition: {
      calories: product.nutriments?.['energy-kcal_100g'],
      proteins: product.nutriments?.proteins_100g,
      carbs: product.nutriments?.carbohydrates_100g,
      fat: product.nutriments?.fat_100g,
    },
    nutriscore: product.nutriscore_grade,
    imageUrl: product.image_url,
    source: 'openfoodfacts',
    importedAt: new Date(),
  };
}

/**
 * Importa tutti i prodotti nel database
 */
async function importProducts() {
  console.log('📦 Avvio importazione prodotti da Open Food Facts...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connesso a MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('products');
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const category of ITALIAN_CATEGORIES) {
      console.log(`\n🔍 Importando categoria: ${category}`);
      
      // Fetch prima pagina (50 prodotti per categoria)
      const products = await fetchProductsByCategory(category, 1, 50);
      
      console.log(`   Trovati ${products.length} prodotti`);
      
      for (const rawProduct of products) {
        const product = convertProduct(rawProduct, category);
        
        if (!product) {
          totalSkipped++;
          continue;
        }
        
        try {
          await collection.updateOne(
            { code: product.code },
            { $set: product },
            { upsert: true }
          );
          totalImported++;
        } catch (err) {
          console.warn(`   ⚠️  Errore inserimento ${product.name}`);
          totalSkipped++;
        }
      }
      
      // Rate limiting: 1 secondo tra le richieste
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Riepilogo importazione:');
    console.log(`   Importati: ${totalImported}`);
    console.log(`   Saltati: ${totalSkipped}`);
    
    // Crea indici
    await collection.createIndex({ name: 'text', brand: 'text' });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ code: 1 }, { unique: true });
    console.log('\n✅ Indici creati');
    
    console.log('\n🎉 Importazione completata!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Connessione chiusa');
  }
}

// Esegui
importProducts();
