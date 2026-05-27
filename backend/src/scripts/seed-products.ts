/**
 * Script per popolare MongoDB con il dataset prodotti
 * 
 * Uso:
 *   npm run seed:products
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { PRODUCTS_DATASET } from '../data/products-dataset';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-assistant';

async function seedProducts() {
  console.log('📦 Avvio seed prodotti...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connesso a MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('products');
    
    console.log(`📦 Inserimento di ${PRODUCTS_DATASET.length} prodotti...\n`);
    
    let inserted = 0;
    let updated = 0;
    
    for (const product of PRODUCTS_DATASET) {
      const document = {
        ...product,
        source: 'local-dataset',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await collection.updateOne(
        { name: product.name, category: product.category },
        { $set: document },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }
    
    console.log('\n📊 Riepilogo:');
    console.log(`   Inseriti: ${inserted}`);
    console.log(`   Aggiornati: ${updated}`);
    console.log(`   Totale nel dataset: ${PRODUCTS_DATASET.length}`);
    
    // Crea indici
    await collection.createIndex({ name: 'text' });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ tags: 1 });
    console.log('\n✅ Indici creati');
    
    console.log('\n🎉 Seed prodotti completato!');
    
  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Connessione chiusa');
  }
}

seedProducts();
