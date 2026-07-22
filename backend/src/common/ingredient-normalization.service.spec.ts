import { IngredientNormalizationService } from './ingredient-normalization.service';

describe('IngredientNormalizationService', () => {
  let svc: IngredientNormalizationService;

  beforeEach(() => {
    svc = new IngredientNormalizationService();
  });

  // ─── normalizeUnit ──────────────────────────────────────────────────────────

  describe('normalizeUnit', () => {
    it('kg → g (×1000)', () => {
      expect(svc.normalizeUnit(1, 'kg')).toEqual({ quantity: 1000, unit: 'g' });
    });

    it('0.5 kg → 500 g', () => {
      expect(svc.normalizeUnit(0.5, 'kg')).toEqual({ quantity: 500, unit: 'g' });
    });

    it('g unchanged', () => {
      expect(svc.normalizeUnit(200, 'g')).toEqual({ quantity: 200, unit: 'g' });
    });

    it('l → ml (×1000)', () => {
      expect(svc.normalizeUnit(1, 'l')).toEqual({ quantity: 1000, unit: 'ml' });
    });

    it('dl → ml (×100)', () => {
      expect(svc.normalizeUnit(2, 'dl')).toEqual({ quantity: 200, unit: 'ml' });
    });

    it('cucchiai → ml (×15)', () => {
      expect(svc.normalizeUnit(2, 'cucchiai')).toEqual({ quantity: 30, unit: 'ml' });
    });

    it('cucchiaini → ml (×5)', () => {
      expect(svc.normalizeUnit(3, 'cucchiaini')).toEqual({ quantity: 15, unit: 'ml' });
    });

    it('spicchi → pz (alias)', () => {
      expect(svc.normalizeUnit(3, 'spicchi')).toEqual({ quantity: 3, unit: 'pz' });
    });

    it('fette → pz (alias)', () => {
      expect(svc.normalizeUnit(2, 'fette')).toEqual({ quantity: 2, unit: 'pz' });
    });

    it('unit casing normalised', () => {
      expect(svc.normalizeUnit(1, 'KG')).toEqual({ quantity: 1000, unit: 'g' });
    });
  });

  // ─── mergeItems ─────────────────────────────────────────────────────────────

  describe('mergeItems — kg/g merge (roadmap scenario)', () => {
    it('1 kg + 500 g → 1500 g', () => {
      const existing = [{ ingredient: 'farina', quantity: 1, unit: 'kg', category: 'altro', isDone: false }];
      const incoming = [{ ingredient: 'farina', quantity: 500, unit: 'g', category: 'altro' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ quantity: 1500, unit: 'g' });
    });

    it('case-insensitive ingredient name merging', () => {
      const existing = [{ ingredient: 'Parmigiano', quantity: 100, unit: 'g', category: 'latticini', isDone: false }];
      const incoming = [{ ingredient: 'parmigiano', quantity: 50, unit: 'g', category: 'latticini' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(150);
    });

    it('incompatible units (g vs pz) remain separate entries', () => {
      const existing = [{ ingredient: 'uova', quantity: 200, unit: 'g', category: 'latticini', isDone: false }];
      const incoming = [{ ingredient: 'uova', quantity: 3, unit: 'pz', category: 'latticini' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result).toHaveLength(2);
    });

    it('preserves isDone flag on existing items', () => {
      const existing = [{ ingredient: 'sale', quantity: 1, unit: 'pz', category: 'spezie', isDone: true }];
      const incoming = [{ ingredient: 'olio', quantity: 50, unit: 'ml', category: 'condimenti' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result.find(i => i.ingredient === 'sale')?.isDone).toBe(true);
    });

    it('new items added with isDone: false', () => {
      const existing = [{ ingredient: 'sale', quantity: 1, unit: 'pz', category: 'spezie', isDone: false }];
      const incoming = [{ ingredient: 'pepe', quantity: 1, unit: 'pz', category: 'spezie' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result).toHaveLength(2);
      expect(result.find(i => i.ingredient === 'pepe')?.isDone).toBe(false);
    });

    it('quantity is rounded to 2 decimal places', () => {
      const existing = [{ ingredient: 'olio', quantity: 1, unit: 'dl', category: 'condimenti', isDone: false }];
      const incoming = [{ ingredient: 'olio', quantity: 50, unit: 'ml', category: 'condimenti' }];
      const result = svc.mergeItems(existing, incoming);
      expect(result[0].quantity).toBe(150); // 100 + 50
    });
  });

  // ─── detectAllergens ────────────────────────────────────────────────────────

  describe('detectAllergens (roadmap scenario: dieta/allergeni)', () => {
    it('detects latticini in parmigiano', () => {
      expect(svc.detectAllergens('parmigiano')).toContain('latticini');
    });

    it('detects glutine in spaghetti', () => {
      expect(svc.detectAllergens('spaghetti')).toContain('glutine');
    });

    it('detects uova', () => {
      expect(svc.detectAllergens('uova')).toContain('uova');
    });

    it('detects soia in tofu', () => {
      expect(svc.detectAllergens('tofu affumicato')).toContain('soia');
    });

    it('returns empty array for allergen-free ingredient', () => {
      expect(svc.detectAllergens('pomodori pelati')).toHaveLength(0);
    });
  });

  // ─── filterByAllergens ──────────────────────────────────────────────────────

  describe('filterByAllergens', () => {
    const items = [
      { ingredient: 'spaghetti',       quantity: 400, unit: 'g',  category: 'pasta',    isDone: false },
      { ingredient: 'guanciale',       quantity: 200, unit: 'g',  category: 'carne',    isDone: false },
      { ingredient: 'parmigiano',      quantity: 100, unit: 'g',  category: 'latticini',isDone: false },
      { ingredient: 'pomodori pelati', quantity: 300, unit: 'g',  category: 'verdure',  isDone: false },
    ];

    it('flags parmigiano for latticini-allergic user', () => {
      const { safe, flagged } = svc.filterByAllergens(items, ['latticini']);
      expect(flagged.map(f => f.item.ingredient)).toContain('parmigiano');
      expect(safe.map(i => i.ingredient)).not.toContain('parmigiano');
    });

    it('flags spaghetti for gluten-intolerant user', () => {
      const { flagged } = svc.filterByAllergens(items, ['glutine']);
      expect(flagged.map(f => f.item.ingredient)).toContain('spaghetti');
    });

    it('returns all items as safe when no allergens provided', () => {
      const { safe, flagged } = svc.filterByAllergens(items, []);
      expect(safe).toHaveLength(items.length);
      expect(flagged).toHaveLength(0);
    });

    it('flagged items include which allergens were detected', () => {
      const { flagged } = svc.filterByAllergens(items, ['latticini']);
      const parmigiano = flagged.find(f => f.item.ingredient === 'parmigiano');
      expect(parmigiano?.allergens).toContain('latticini');
    });
  });
});
