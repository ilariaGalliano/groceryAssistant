import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesModule } from './recipes/recipes.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const useMemory = config.get<string>('USE_MEMORY_DB') === 'true';
        const uri = config.get<string>('MONGODB_URI');

        if (!useMemory && uri && uri.length > 0) {
          console.log('🌐 Connessione a MongoDB Atlas...');
          return { uri };
        }

        // MongoDB in-memory per sviluppo/test locale
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        console.log('⚡ Usando MongoDB in-memory:', memUri);
        return { uri: memUri };
      },
    }),
    RecipesModule,
    ShoppingListModule,
    AiModule,
    AuthModule,
  ],
})
export class AppModule {}
