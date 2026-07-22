import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RecipesModule } from './recipes/recipes.module';
import { ShoppingListModule } from './shopping-list/shopping-list.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting globale: max 60 richieste per minuto per IP
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 60 }] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const useMemory = config.get<string>('USE_MEMORY_DB') === 'true';
        const uri = config.get<string>('MONGODB_URI');

        if (!useMemory) {
          if (!uri) {
            throw new Error('MONGODB_URI environment variable is required but not set. Set USE_MEMORY_DB=true to use in-memory database for local development.');
          }
          console.log('🌐 Connessione a MongoDB Atlas...');
          return { uri };
        }

        // MongoDB in-memory solo se USE_MEMORY_DB=true (sviluppo/test locale)
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
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
