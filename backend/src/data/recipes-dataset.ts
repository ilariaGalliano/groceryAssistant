/**
 * Golden Dataset di ricette italiane
 * Struttura semanticamente consistente per embedding e vector search
 */

export interface RecipeData {
  name: string;
  cuisine: string;
  category: 'primo' | 'secondo' | 'dolce' | 'antipasto' | 'contorno';
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isVegetarian: boolean;
  basePeople: number;
  ingredients: {
    ingredient: string;
    quantity: number;
    unit: string;
    category: string;
  }[];
  // Testo ottimizzato per embedding
  embeddingText?: string;
}

export const RECIPES_DATASET: RecipeData[] = [
  // === PRIMI PIATTI ===
  {
    name: 'Carbonara',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'roman', 'guanciale', 'uova'],
    difficulty: 'medium',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'spaghetti', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'guanciale', quantity: 200, unit: 'g', category: 'carne' },
      { ingredient: 'uova', quantity: 4, unit: 'pz', category: 'latticini' },
      { ingredient: 'pecorino romano', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'pepe nero', quantity: 2, unit: 'cucchiaini', category: 'spezie' },
    ],
  },
  {
    name: 'Amatriciana',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'roman', 'guanciale', 'pomodoro'],
    difficulty: 'medium',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'spaghetti', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'guanciale', quantity: 150, unit: 'g', category: 'carne' },
      { ingredient: 'pomodori pelati', quantity: 400, unit: 'g', category: 'verdure' },
      { ingredient: 'pecorino romano', quantity: 80, unit: 'g', category: 'latticini' },
      { ingredient: 'peperoncino', quantity: 1, unit: 'pz', category: 'spezie' },
    ],
  },
  {
    name: 'Cacio e Pepe',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'roman', 'pecorino', 'pepe'],
    difficulty: 'hard',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'tonnarelli', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'pecorino romano', quantity: 200, unit: 'g', category: 'latticini' },
      { ingredient: 'pepe nero', quantity: 4, unit: 'cucchiaini', category: 'spezie' },
    ],
  },
  {
    name: 'Lasagna',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'forno', 'ragù', 'besciamella'],
    difficulty: 'hard',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'lasagne fresche', quantity: 500, unit: 'g', category: 'pasta' },
      { ingredient: 'ragù di carne', quantity: 500, unit: 'g', category: 'carne' },
      { ingredient: 'besciamella', quantity: 500, unit: 'ml', category: 'latticini' },
      { ingredient: 'parmigiano', quantity: 150, unit: 'g', category: 'latticini' },
      { ingredient: 'mozzarella', quantity: 200, unit: 'g', category: 'latticini' },
    ],
  },
  {
    name: 'Pesto alla Genovese',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'ligure', 'basilico', 'pinoli'],
    difficulty: 'easy',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'trofie', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'basilico fresco', quantity: 80, unit: 'g', category: 'verdure' },
      { ingredient: 'pinoli', quantity: 30, unit: 'g', category: 'altro' },
      { ingredient: 'parmigiano', quantity: 60, unit: 'g', category: 'latticini' },
      { ingredient: 'aglio', quantity: 1, unit: 'spicchio', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 80, unit: 'ml', category: 'altro' },
    ],
  },
  {
    name: 'Risotto alla Milanese',
    cuisine: 'italian',
    category: 'primo',
    tags: ['riso', 'lombardo', 'zafferano', 'burro'],
    difficulty: 'medium',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'riso carnaroli', quantity: 320, unit: 'g', category: 'cereali' },
      { ingredient: 'zafferano', quantity: 1, unit: 'bustina', category: 'spezie' },
      { ingredient: 'burro', quantity: 80, unit: 'g', category: 'latticini' },
      { ingredient: 'parmigiano', quantity: 80, unit: 'g', category: 'latticini' },
      { ingredient: 'cipolla', quantity: 1, unit: 'pz', category: 'verdure' },
      { ingredient: 'brodo vegetale', quantity: 1000, unit: 'ml', category: 'altro' },
      { ingredient: 'vino bianco', quantity: 100, unit: 'ml', category: 'altro' },
    ],
  },
  {
    name: 'Spaghetti alle Vongole',
    cuisine: 'italian',
    category: 'primo',
    tags: ['pasta', 'pesce', 'mare', 'vongole'],
    difficulty: 'medium',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'spaghetti', quantity: 400, unit: 'g', category: 'pasta' },
      { ingredient: 'vongole veraci', quantity: 1000, unit: 'g', category: 'pesce' },
      { ingredient: 'aglio', quantity: 3, unit: 'spicchi', category: 'verdure' },
      { ingredient: 'prezzemolo', quantity: 1, unit: 'mazzetto', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 60, unit: 'ml', category: 'altro' },
      { ingredient: 'peperoncino', quantity: 1, unit: 'pz', category: 'spezie' },
      { ingredient: 'vino bianco', quantity: 100, unit: 'ml', category: 'altro' },
    ],
  },

  // === DOLCI ===
  {
    name: 'Tiramisù',
    cuisine: 'italian',
    category: 'dolce',
    tags: ['dolce', 'caffè', 'mascarpone', 'savoiardi'],
    difficulty: 'medium',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'mascarpone', quantity: 500, unit: 'g', category: 'latticini' },
      { ingredient: 'uova', quantity: 4, unit: 'pz', category: 'latticini' },
      { ingredient: 'savoiardi', quantity: 300, unit: 'g', category: 'altro' },
      { ingredient: 'caffè espresso', quantity: 300, unit: 'ml', category: 'altro' },
      { ingredient: 'zucchero', quantity: 100, unit: 'g', category: 'altro' },
      { ingredient: 'cacao amaro', quantity: 30, unit: 'g', category: 'altro' },
    ],
  },
  {
    name: 'Cheesecake',
    cuisine: 'international',
    category: 'dolce',
    tags: ['dolce', 'freddo', 'formaggio', 'biscotti'],
    difficulty: 'medium',
    isVegetarian: true,
    basePeople: 8,
    ingredients: [
      { ingredient: 'biscotti digestive', quantity: 250, unit: 'g', category: 'altro' },
      { ingredient: 'burro', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'formaggio spalmabile', quantity: 500, unit: 'g', category: 'latticini' },
      { ingredient: 'zucchero', quantity: 150, unit: 'g', category: 'altro' },
      { ingredient: 'panna fresca', quantity: 200, unit: 'ml', category: 'latticini' },
      { ingredient: 'colla di pesce', quantity: 12, unit: 'g', category: 'altro' },
    ],
  },
  {
    name: "Cheesecake all'Amarena",
    cuisine: 'italian',
    category: 'dolce',
    tags: ['dolce', 'freddo', 'formaggio', 'amarene', 'frutta'],
    difficulty: 'medium',
    isVegetarian: true,
    basePeople: 8,
    ingredients: [
      { ingredient: 'biscotti digestive', quantity: 250, unit: 'g', category: 'altro' },
      { ingredient: 'burro', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'formaggio spalmabile', quantity: 500, unit: 'g', category: 'latticini' },
      { ingredient: 'zucchero', quantity: 120, unit: 'g', category: 'altro' },
      { ingredient: 'panna fresca', quantity: 200, unit: 'ml', category: 'latticini' },
      { ingredient: 'colla di pesce', quantity: 12, unit: 'g', category: 'altro' },
      { ingredient: 'amarene sciroppate', quantity: 300, unit: 'g', category: 'frutta' },
      { ingredient: 'succo di limone', quantity: 1, unit: 'cucchiaio', category: 'altro' },
    ],
  },
  {
    name: 'Panna Cotta',
    cuisine: 'italian',
    category: 'dolce',
    tags: ['dolce', 'panna', 'vaniglia', 'piemonte'],
    difficulty: 'easy',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'panna fresca', quantity: 500, unit: 'ml', category: 'latticini' },
      { ingredient: 'zucchero', quantity: 80, unit: 'g', category: 'altro' },
      { ingredient: 'colla di pesce', quantity: 8, unit: 'g', category: 'altro' },
      { ingredient: 'bacca di vaniglia', quantity: 1, unit: 'pz', category: 'spezie' },
    ],
  },
  {
    name: 'Torta di Mele',
    cuisine: 'italian',
    category: 'dolce',
    tags: ['dolce', 'mele', 'forno', 'torta'],
    difficulty: 'easy',
    isVegetarian: true,
    basePeople: 8,
    ingredients: [
      { ingredient: 'mele golden', quantity: 1000, unit: 'g', category: 'frutta' },
      { ingredient: 'farina 00', quantity: 300, unit: 'g', category: 'altro' },
      { ingredient: 'zucchero', quantity: 200, unit: 'g', category: 'altro' },
      { ingredient: 'uova', quantity: 3, unit: 'pz', category: 'latticini' },
      { ingredient: 'burro', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'lievito per dolci', quantity: 16, unit: 'g', category: 'altro' },
      { ingredient: 'succo di limone', quantity: 2, unit: 'cucchiai', category: 'altro' },
    ],
  },
  {
    name: 'Cannoli Siciliani',
    cuisine: 'italian',
    category: 'dolce',
    tags: ['dolce', 'sicilia', 'ricotta', 'fritto'],
    difficulty: 'hard',
    isVegetarian: true,
    basePeople: 6,
    ingredients: [
      { ingredient: 'ricotta di pecora', quantity: 500, unit: 'g', category: 'latticini' },
      { ingredient: 'zucchero a velo', quantity: 150, unit: 'g', category: 'altro' },
      { ingredient: 'farina 00', quantity: 250, unit: 'g', category: 'altro' },
      { ingredient: 'strutto', quantity: 30, unit: 'g', category: 'altro' },
      { ingredient: 'marsala', quantity: 50, unit: 'ml', category: 'altro' },
      { ingredient: 'gocce di cioccolato', quantity: 100, unit: 'g', category: 'altro' },
      { ingredient: 'scorza di arancia candita', quantity: 50, unit: 'g', category: 'frutta' },
    ],
  },

  // === SECONDI PIATTI ===
  {
    name: 'Cotoletta alla Milanese',
    cuisine: 'italian',
    category: 'secondo',
    tags: ['carne', 'lombardo', 'fritto', 'panato'],
    difficulty: 'easy',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'costolette di vitello', quantity: 4, unit: 'pz', category: 'carne' },
      { ingredient: 'uova', quantity: 2, unit: 'pz', category: 'latticini' },
      { ingredient: 'pangrattato', quantity: 200, unit: 'g', category: 'altro' },
      { ingredient: 'burro', quantity: 100, unit: 'g', category: 'latticini' },
      { ingredient: 'sale', quantity: 1, unit: 'q.b.', category: 'spezie' },
    ],
  },
  {
    name: 'Saltimbocca alla Romana',
    cuisine: 'italian',
    category: 'secondo',
    tags: ['carne', 'romano', 'prosciutto', 'salvia'],
    difficulty: 'easy',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'fettine di vitello', quantity: 400, unit: 'g', category: 'carne' },
      { ingredient: 'prosciutto crudo', quantity: 100, unit: 'g', category: 'carne' },
      { ingredient: 'salvia', quantity: 12, unit: 'foglie', category: 'verdure' },
      { ingredient: 'burro', quantity: 50, unit: 'g', category: 'latticini' },
      { ingredient: 'vino bianco', quantity: 100, unit: 'ml', category: 'altro' },
    ],
  },
  {
    name: 'Pollo alla Cacciatora',
    cuisine: 'italian',
    category: 'secondo',
    tags: ['carne', 'pollo', 'pomodoro', 'olive'],
    difficulty: 'medium',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'pollo a pezzi', quantity: 1200, unit: 'g', category: 'carne' },
      { ingredient: 'pomodori pelati', quantity: 400, unit: 'g', category: 'verdure' },
      { ingredient: 'olive nere', quantity: 100, unit: 'g', category: 'verdure' },
      { ingredient: 'cipolla', quantity: 1, unit: 'pz', category: 'verdure' },
      { ingredient: 'rosmarino', quantity: 1, unit: 'rametto', category: 'verdure' },
      { ingredient: 'vino bianco', quantity: 150, unit: 'ml', category: 'altro' },
    ],
  },
  {
    name: 'Branzino al Forno',
    cuisine: 'italian',
    category: 'secondo',
    tags: ['pesce', 'forno', 'mediterraneo'],
    difficulty: 'easy',
    isVegetarian: false,
    basePeople: 4,
    ingredients: [
      { ingredient: 'branzino', quantity: 2, unit: 'pz', category: 'pesce' },
      { ingredient: 'patate', quantity: 500, unit: 'g', category: 'verdure' },
      { ingredient: 'pomodorini', quantity: 200, unit: 'g', category: 'verdure' },
      { ingredient: 'olive taggiasche', quantity: 100, unit: 'g', category: 'verdure' },
      { ingredient: 'capperi', quantity: 30, unit: 'g', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 60, unit: 'ml', category: 'altro' },
      { ingredient: 'limone', quantity: 1, unit: 'pz', category: 'frutta' },
    ],
  },

  // === ANTIPASTI ===
  {
    name: 'Bruschetta al Pomodoro',
    cuisine: 'italian',
    category: 'antipasto',
    tags: ['antipasto', 'pomodoro', 'pane', 'basilico'],
    difficulty: 'easy',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'pane casereccio', quantity: 4, unit: 'fette', category: 'altro' },
      { ingredient: 'pomodori maturi', quantity: 4, unit: 'pz', category: 'verdure' },
      { ingredient: 'aglio', quantity: 2, unit: 'spicchi', category: 'verdure' },
      { ingredient: 'basilico fresco', quantity: 8, unit: 'foglie', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 40, unit: 'ml', category: 'altro' },
    ],
  },
  {
    name: 'Caprese',
    cuisine: 'italian',
    category: 'antipasto',
    tags: ['antipasto', 'mozzarella', 'pomodoro', 'campania'],
    difficulty: 'easy',
    isVegetarian: true,
    basePeople: 4,
    ingredients: [
      { ingredient: 'mozzarella di bufala', quantity: 400, unit: 'g', category: 'latticini' },
      { ingredient: 'pomodori cuore di bue', quantity: 400, unit: 'g', category: 'verdure' },
      { ingredient: 'basilico fresco', quantity: 12, unit: 'foglie', category: 'verdure' },
      { ingredient: 'olio extravergine', quantity: 40, unit: 'ml', category: 'altro' },
    ],
  },
];

/**
 * Genera testo ottimizzato per embedding
 */
export function generateEmbeddingText(recipe: RecipeData): string {
  const ingredientsList = recipe.ingredients.map((i) => i.ingredient).join(', ');
  return `${recipe.name}. ${recipe.cuisine} ${recipe.category}. Ingredienti: ${ingredientsList}. Tags: ${recipe.tags.join(', ')}. ${recipe.isVegetarian ? 'Vegetariano.' : ''}`;
}

/**
 * Cerca ricetta per nome (fuzzy match)
 */
export function findRecipeByName(name: string): RecipeData | undefined {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return RECIPES_DATASET.find((r) => {
    const recipeName = r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return recipeName.includes(normalized) || normalized.includes(recipeName);
  });
}

/**
 * Cerca ricette per categoria
 */
export function findRecipesByCategory(category: RecipeData['category']): RecipeData[] {
  return RECIPES_DATASET.filter((r) => r.category === category);
}

/**
 * Cerca ricette vegetariane
 */
export function findVegetarianRecipes(): RecipeData[] {
  return RECIPES_DATASET.filter((r) => r.isVegetarian);
}
