/**
 * Script per popolare MongoDB con il golden dataset di ricette
 * 
 * Uso:
 *   npx ts-node src/scripts/seed-recipes.ts
 * 
 * Oppure aggiungi a package.json:
 *   "seed": "ts-node src/scripts/seed-recipes.ts"
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { RECIPES_DATASET, generateEmbeddingText } from '../data/recipes-dataset';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-assistant';

async function generateMockEmbedding(text: string): Promise<number[]> {
  // Per sviluppo: genera un embedding deterministico basato sul testo
  // In produzione, usa OpenAI text-embedding-3-small
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  
  const seed = Math.abs(hash);
  const embedding: number[] = [];
  
  for (let i = 0; i < 1536; i++) {
    // Pseudo-random deterministico basato sul seed
    const x = Math.sin(seed * (i + 1)) * 10000;
    embedding.push(x - Math.floor(x));
  }
  
  // Normalizza il vettore
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

async function seedRecipes() {
  console.log('🌱 Avvio seed del database con golden dataset...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connesso a MongoDB\n');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Pulisci la collezione esistente (opzionale)
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Trovate ${existingCount} ricette esistenti. Vuoi sovrascriverle? (proceeding anyway for script)`);
      // In uno script interattivo, potresti chiedere conferma
    }
    
    console.log(`📦 Inserimento di ${RECIPES_DATASET.length} ricette...\n`);
    
    let inserted = 0;
    let updated = 0;
    
    for (const recipe of RECIPES_DATASET) {
      const embeddingText = generateEmbeddingText(recipe);
      const embedding = await generateMockEmbedding(embeddingText);
      
      const document = {
        name: recipe.name,
        cuisine: recipe.cuisine,
        category: recipe.category,
        tags: recipe.tags,
        difficulty: recipe.difficulty,
        isVegetarian: recipe.isVegetarian,
        people: recipe.basePeople,
        ingredients: recipe.ingredients,
        description: `${recipe.name} - ${recipe.category} ${recipe.cuisine}`,
        embedding: embedding,
        embeddingText: embeddingText,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await collection.updateOne(
        { name: recipe.name, isVegetarian: recipe.isVegetarian },
        { $set: document },
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        inserted++;
        console.log(`  ✨ Inserita: ${recipe.name}`);
      } else if (result.modifiedCount > 0) {
        updated++;
        console.log(`  🔄 Aggiornata: ${recipe.name}`);
      } else {
        console.log(`  ⏭️  Invariata: ${recipe.name}`);
      }
    }
    
    console.log('\n📊 Riepilogo:');
    console.log(`   Inserite: ${inserted}`);
    console.log(`   Aggiornate: ${updated}`);
    console.log(`   Totale nel dataset: ${RECIPES_DATASET.length}`);
    
    // Crea indice per vector search (se non esiste)
    console.log('\n🔍 Verifica indici...');
    
    const indexes = await collection.indexes();
    const hasVectorIndex = indexes.some(idx => idx.name === 'recipe_vector_index');
    
    if (!hasVectorIndex) {
      console.log('⚠️  Indice vector search non trovato.');
      console.log('   Per crearlo su MongoDB Atlas, esegui:');
      console.log(`
   {
     "name": "recipe_vector_index",
     "type": "vectorSearch",
     "definition": {
       "fields": [{
         "type": "vector",
         "path": "embedding",
         "numDimensions": 1536,
         "similarity": "cosine"
       }]
     }
   }
      `);
    } else {
      console.log('✅ Indice vector search già presente');
    }
    
    // Crea indici standard
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ isVegetarian: 1 });
    await collection.createIndex({ tags: 1 });
    console.log('✅ Indici standard creati/verificati');
    
    console.log('\n🎉 Seed completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Connessione chiusa');
  }
}

// Esegui
seedRecipes();
