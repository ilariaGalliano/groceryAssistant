/**
 * E2E test skeleton — 4 roadmap scenarios
 *
 * Prerequisites:
 *   - USE_MEMORY_DB=true  (set in .env.test or jest config)
 *   - JWT_SECRET=test-secret
 *   - No GEMINI_API_KEY (uses deterministic dataset path)
 *
 * Run: cd backend && USE_MEMORY_DB=true JWT_SECRET=test-secret npx jest --config test/jest-e2e.json
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

// ─── helpers ────────────────────────────────────────────────────────────────

async function registerAndLogin(app: INestApplication, email: string, password: string): Promise<string> {
  await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, password })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(201);

  return res.body.access_token as string;
}

// ─── setup ──────────────────────────────────────────────────────────────────

describe('Shopping-list domain (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.USE_MEMORY_DB = 'true';
    process.env.JWT_SECRET = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Scenario 1: isolamento tra utenti ──────────────────────────────────

  describe('Scenario 1 — two users cannot see each other\'s shopping list', () => {
    it('user A list is not visible to user B', async () => {
      const tokenA = await registerAndLogin(app, 'alice@test.com', 'password123');
      const tokenB = await registerAndLogin(app, 'bob@test.com', 'password123');

      // User A generates a list
      await request(app.getHttpServer())
        .post('/api/shopping-list/generate')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ recipes: [{ name: 'Carbonara', people: 2 }], append: false })
        .expect(201);

      // User B list should be empty
      const resB = await request(app.getHttpServer())
        .get('/api/shopping-list')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(resB.body.items).toHaveLength(0);
    });

    it('deleting user A list does not affect user B list', async () => {
      const tokenA = await registerAndLogin(app, 'alice2@test.com', 'password123');
      const tokenB = await registerAndLogin(app, 'bob2@test.com', 'password123');

      await request(app.getHttpServer())
        .post('/api/shopping-list/generate')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ recipes: [{ name: 'Carbonara', people: 2 }], append: false })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/shopping-list/generate')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ recipes: [{ name: 'Amatriciana', people: 2 }], append: false })
        .expect(201);

      // A clears their list
      await request(app.getHttpServer())
        .delete('/api/shopping-list')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      // B list must still exist
      const resB = await request(app.getHttpServer())
        .get('/api/shopping-list')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(resB.body.items.length).toBeGreaterThan(0);
    });
  });

  // ─── Scenario 2: merge kg/g ─────────────────────────────────────────────

  describe('Scenario 2 — unit merge (kg + g → g)', () => {
    it('appending a recipe with the same ingredient in different unit merges correctly', async () => {
      const token = await registerAndLogin(app, 'merge@test.com', 'password123');

      // First generate: Lasagna (has farina in g)
      await request(app.getHttpServer())
        .post('/api/shopping-list/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ recipes: [{ name: 'Lasagna', people: 4 }], append: false })
        .expect(201);

      // Manually add farina in kg
      await request(app.getHttpServer())
        .patch('/api/shopping-list/add-item')
        .set('Authorization', `Bearer ${token}`)
        .send({ ingredient: 'farina', quantity: 1, unit: 'kg', category: 'pasta' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/api/shopping-list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const farinaItems = res.body.items.filter((i: any) => i.ingredient === 'farina');
      // Must be merged into one entry (both in g after normalization)
      expect(farinaItems).toHaveLength(1);
      expect(farinaItems[0].unit).toBe('g');
    });
  });

  // ─── Scenario 3: dieta / allergeni ──────────────────────────────────────

  describe('Scenario 3 — vegetarian diet preference filters meat ingredients', () => {
    it('generates list without meat for vegetarian user', async () => {
      const token = await registerAndLogin(app, 'veg@test.com', 'password123');

      const res = await request(app.getHttpServer())
        .post('/api/shopping-list/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipes: [{ name: 'Carbonara', people: 4 }],
          append: false,
          // NOTE: diet filtering on generate endpoint is triggered via processRecipes,
          // this test validates the dataset path with preferences
        })
        .expect(201);

      // Default generate uses dataset without diet — guanciale is present
      const items: any[] = res.body.items;
      // Process with vegetarian preference
      const processRes = await request(app.getHttpServer())
        .post('/api/recipes/process')
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'carbonara per 4 persone',
          preferences: { diets: ['vegetariano'], budget: 'medio', mealType: 'cena' },
        })
        .expect(201);

      const allIngredients: string[] = processRes.body.recipes
        .flatMap((r: any) => r.original.ingredients.map((i: any) => i.ingredient.toLowerCase()));

      expect(allIngredients).not.toContain('guanciale');
      expect(allIngredients).not.toContain('pancetta');
    });
  });

  // ─── Scenario 4: risposta AI malformata ─────────────────────────────────

  describe('Scenario 4 — malformed / empty AI response falls back gracefully', () => {
    it('returns 201 with empty recipes array when AI returns nothing recognisable', async () => {
      const token = await registerAndLogin(app, 'aitest@test.com', 'password123');

      // With no GEMINI_API_KEY the service uses fallbackParseRecipes.
      // Sending unrecognisable input should return an empty or valid response, never 500.
      const res = await request(app.getHttpServer())
        .post('/api/recipes/process')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'xyzzy zork plugh', preferences: {} })
        .expect(201);

      // Must be a valid shape: { recipes: [] }
      expect(res.body).toHaveProperty('recipes');
      expect(Array.isArray(res.body.recipes)).toBe(true);
    });

    it('rejects oversized text with 400', async () => {
      const token = await registerAndLogin(app, 'aitest2@test.com', 'password123');

      await request(app.getHttpServer())
        .post('/api/recipes/process')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'a'.repeat(5001) })
        .expect(400);
    });
  });
});
