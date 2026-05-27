/**
 * Golden Dataset di prodotti alimentari italiani
 * Per la lista della spesa - prodotti comuni da supermercato
 */

export interface ProductData {
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  unit: string;
  defaultQuantity: number;
  tags: string[];
  nutrition?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fat?: number;
  };
}

export const PRODUCTS_DATASET: ProductData[] = [
  // === PASTA ===
  { name: 'Spaghetti', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Penne Rigate', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Fusilli', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Rigatoni', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Farfalle', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Linguine', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Fettuccine', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'primo'] },
  { name: 'Orecchiette', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'puglia'] },
  { name: 'Trofie', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'liguria'] },
  { name: 'Paccheri', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'grano', 'campania'] },
  { name: 'Lasagne Fresche', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'fresca', 'forno'] },
  { name: 'Tortellini', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'ripiena', 'emilia'] },
  { name: 'Ravioli', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['pasta', 'ripiena'] },
  { name: 'Gnocchi di Patate', category: 'pasta', unit: 'g', defaultQuantity: 500, tags: ['gnocchi', 'patate'] },

  // === RISO E CEREALI ===
  { name: 'Riso Carnaroli', category: 'cereali', unit: 'g', defaultQuantity: 1000, tags: ['riso', 'risotto'] },
  { name: 'Riso Arborio', category: 'cereali', unit: 'g', defaultQuantity: 1000, tags: ['riso', 'risotto'] },
  { name: 'Riso Basmati', category: 'cereali', unit: 'g', defaultQuantity: 1000, tags: ['riso', 'contorno'] },
  { name: 'Farro', category: 'cereali', unit: 'g', defaultQuantity: 500, tags: ['cereali', 'insalata'] },
  { name: 'Orzo', category: 'cereali', unit: 'g', defaultQuantity: 500, tags: ['cereali', 'zuppa'] },
  { name: 'Polenta', category: 'cereali', unit: 'g', defaultQuantity: 500, tags: ['mais', 'contorno'] },

  // === PANE E PRODOTTI DA FORNO ===
  { name: 'Pane Casereccio', category: 'pane', unit: 'g', defaultQuantity: 500, tags: ['pane', 'fresco'] },
  { name: 'Pane Integrale', category: 'pane', unit: 'g', defaultQuantity: 500, tags: ['pane', 'integrale'] },
  { name: 'Pancarré', category: 'pane', unit: 'g', defaultQuantity: 400, tags: ['pane', 'toast'] },
  { name: 'Crackers', category: 'pane', unit: 'g', defaultQuantity: 500, tags: ['crackers', 'snack'] },
  { name: 'Crackers Integrali', category: 'pane', unit: 'g', defaultQuantity: 500, tags: ['crackers', 'integrale'] },
  { name: 'Gallette di Riso', category: 'pane', unit: 'g', defaultQuantity: 130, tags: ['gallette', 'riso', 'dieta'] },
  { name: 'Gallette di Mais', category: 'pane', unit: 'g', defaultQuantity: 130, tags: ['gallette', 'mais', 'dieta'] },
  { name: 'Fette Biscottate', category: 'pane', unit: 'g', defaultQuantity: 320, tags: ['fette', 'colazione'] },
  { name: 'Fette Biscottate Integrali', category: 'pane', unit: 'g', defaultQuantity: 320, tags: ['fette', 'integrale'] },
  { name: 'Grissini', category: 'pane', unit: 'g', defaultQuantity: 250, tags: ['grissini', 'antipasto'] },
  { name: 'Taralli', category: 'pane', unit: 'g', defaultQuantity: 300, tags: ['taralli', 'puglia', 'snack'] },
  { name: 'Focaccia', category: 'pane', unit: 'g', defaultQuantity: 300, tags: ['focaccia', 'liguria'] },
  { name: 'Piadina', category: 'pane', unit: 'pz', defaultQuantity: 3, tags: ['piadina', 'romagna'] },

  // === LATTICINI ===
  { name: 'Latte Intero', category: 'latticini', unit: 'l', defaultQuantity: 1, tags: ['latte', 'colazione'] },
  { name: 'Latte Parzialmente Scremato', category: 'latticini', unit: 'l', defaultQuantity: 1, tags: ['latte', 'light'] },
  { name: 'Latte Scremato', category: 'latticini', unit: 'l', defaultQuantity: 1, tags: ['latte', 'dieta'] },
  { name: 'Yogurt Bianco', category: 'latticini', unit: 'g', defaultQuantity: 500, tags: ['yogurt', 'colazione'] },
  { name: 'Yogurt alla Frutta', category: 'latticini', unit: 'g', defaultQuantity: 500, tags: ['yogurt', 'dolce'] },
  { name: 'Yogurt Greco', category: 'latticini', unit: 'g', defaultQuantity: 500, tags: ['yogurt', 'proteico'] },
  { name: 'Burro', category: 'latticini', unit: 'g', defaultQuantity: 250, tags: ['burro', 'cottura'] },
  { name: 'Panna Fresca', category: 'latticini', unit: 'ml', defaultQuantity: 250, tags: ['panna', 'dolci'] },
  { name: 'Panna da Cucina', category: 'latticini', unit: 'ml', defaultQuantity: 200, tags: ['panna', 'primi'] },
  { name: 'Mozzarella', category: 'latticini', unit: 'g', defaultQuantity: 250, tags: ['mozzarella', 'pizza'] },
  { name: 'Mozzarella di Bufala', category: 'latticini', unit: 'g', defaultQuantity: 250, tags: ['mozzarella', 'campania'] },
  { name: 'Ricotta', category: 'latticini', unit: 'g', defaultQuantity: 250, tags: ['ricotta', 'dolci'] },
  { name: 'Mascarpone', category: 'latticini', unit: 'g', defaultQuantity: 250, tags: ['mascarpone', 'tiramisu'] },
  { name: 'Parmigiano Reggiano', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['parmigiano', 'formaggio'] },
  { name: 'Pecorino Romano', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['pecorino', 'pasta'] },
  { name: 'Grana Padano', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['grana', 'formaggio'] },
  { name: 'Gorgonzola', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['gorgonzola', 'cremoso'] },
  { name: 'Formaggio Spalmabile', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['philadelphia', 'cheesecake'] },
  { name: 'Stracchino', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['stracchino', 'piadina'] },
  { name: 'Taleggio', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['taleggio', 'lombardia'] },
  { name: 'Fontina', category: 'latticini', unit: 'g', defaultQuantity: 200, tags: ['fontina', 'valdostana'] },

  // === UOVA ===
  { name: 'Uova', category: 'uova', unit: 'pz', defaultQuantity: 6, tags: ['uova', 'base'] },
  { name: 'Uova Biologiche', category: 'uova', unit: 'pz', defaultQuantity: 6, tags: ['uova', 'bio'] },

  // === CARNE ===
  { name: 'Petto di Pollo', category: 'carne', unit: 'g', defaultQuantity: 500, tags: ['pollo', 'bianca'] },
  { name: 'Cosce di Pollo', category: 'carne', unit: 'g', defaultQuantity: 600, tags: ['pollo', 'bianca'] },
  { name: 'Fettine di Vitello', category: 'carne', unit: 'g', defaultQuantity: 400, tags: ['vitello', 'scaloppine'] },
  { name: 'Macinato Misto', category: 'carne', unit: 'g', defaultQuantity: 500, tags: ['macinato', 'ragu'] },
  { name: 'Macinato di Manzo', category: 'carne', unit: 'g', defaultQuantity: 500, tags: ['manzo', 'hamburger'] },
  { name: 'Salsiccia', category: 'carne', unit: 'g', defaultQuantity: 400, tags: ['salsiccia', 'grigliata'] },
  { name: 'Guanciale', category: 'carne', unit: 'g', defaultQuantity: 200, tags: ['guanciale', 'carbonara'] },
  { name: 'Pancetta', category: 'carne', unit: 'g', defaultQuantity: 200, tags: ['pancetta', 'amatriciana'] },
  { name: 'Prosciutto Crudo', category: 'carne', unit: 'g', defaultQuantity: 150, tags: ['prosciutto', 'crudo'] },
  { name: 'Prosciutto Cotto', category: 'carne', unit: 'g', defaultQuantity: 150, tags: ['prosciutto', 'cotto'] },
  { name: 'Bresaola', category: 'carne', unit: 'g', defaultQuantity: 100, tags: ['bresaola', 'valtellina'] },
  { name: 'Speck', category: 'carne', unit: 'g', defaultQuantity: 150, tags: ['speck', 'trentino'] },
  { name: 'Mortadella', category: 'carne', unit: 'g', defaultQuantity: 200, tags: ['mortadella', 'bologna'] },
  { name: 'Salame', category: 'carne', unit: 'g', defaultQuantity: 150, tags: ['salame', 'affettato'] },

  // === PESCE ===
  { name: 'Salmone Fresco', category: 'pesce', unit: 'g', defaultQuantity: 400, tags: ['salmone', 'omega3'] },
  { name: 'Branzino', category: 'pesce', unit: 'pz', defaultQuantity: 2, tags: ['branzino', 'forno'] },
  { name: 'Orata', category: 'pesce', unit: 'pz', defaultQuantity: 2, tags: ['orata', 'forno'] },
  { name: 'Tonno Fresco', category: 'pesce', unit: 'g', defaultQuantity: 400, tags: ['tonno', 'grigliata'] },
  { name: 'Gamberi', category: 'pesce', unit: 'g', defaultQuantity: 400, tags: ['gamberi', 'crostacei'] },
  { name: 'Calamari', category: 'pesce', unit: 'g', defaultQuantity: 400, tags: ['calamari', 'fritto'] },
  { name: 'Cozze', category: 'pesce', unit: 'kg', defaultQuantity: 1, tags: ['cozze', 'frutti di mare'] },
  { name: 'Vongole', category: 'pesce', unit: 'kg', defaultQuantity: 1, tags: ['vongole', 'spaghetti'] },
  { name: 'Acciughe', category: 'pesce', unit: 'g', defaultQuantity: 100, tags: ['acciughe', 'pizza'] },
  { name: 'Tonno in Scatola', category: 'conserve', unit: 'g', defaultQuantity: 320, tags: ['tonno', 'conserva'] },

  // === VERDURE ===
  { name: 'Pomodori', category: 'verdure', unit: 'kg', defaultQuantity: 1, tags: ['pomodori', 'insalata'] },
  { name: 'Pomodorini', category: 'verdure', unit: 'g', defaultQuantity: 500, tags: ['pomodorini', 'ciliegini'] },
  { name: 'Zucchine', category: 'verdure', unit: 'kg', defaultQuantity: 1, tags: ['zucchine', 'grigliate'] },
  { name: 'Melanzane', category: 'verdure', unit: 'pz', defaultQuantity: 2, tags: ['melanzane', 'parmigiana'] },
  { name: 'Peperoni', category: 'verdure', unit: 'pz', defaultQuantity: 3, tags: ['peperoni', 'misti'] },
  { name: 'Carote', category: 'verdure', unit: 'kg', defaultQuantity: 1, tags: ['carote', 'soffritto'] },
  { name: 'Cipolle', category: 'verdure', unit: 'kg', defaultQuantity: 1, tags: ['cipolle', 'soffritto'] },
  { name: 'Aglio', category: 'verdure', unit: 'pz', defaultQuantity: 1, tags: ['aglio', 'soffritto'] },
  { name: 'Sedano', category: 'verdure', unit: 'pz', defaultQuantity: 1, tags: ['sedano', 'soffritto'] },
  { name: 'Patate', category: 'verdure', unit: 'kg', defaultQuantity: 2, tags: ['patate', 'forno'] },
  { name: 'Lattuga', category: 'verdure', unit: 'pz', defaultQuantity: 1, tags: ['lattuga', 'insalata'] },
  { name: 'Rucola', category: 'verdure', unit: 'g', defaultQuantity: 125, tags: ['rucola', 'insalata'] },
  { name: 'Spinaci Freschi', category: 'verdure', unit: 'g', defaultQuantity: 500, tags: ['spinaci', 'contorno'] },
  { name: 'Broccoli', category: 'verdure', unit: 'pz', defaultQuantity: 1, tags: ['broccoli', 'contorno'] },
  { name: 'Cavolfiore', category: 'verdure', unit: 'pz', defaultQuantity: 1, tags: ['cavolfiore', 'contorno'] },
  { name: 'Funghi Champignon', category: 'verdure', unit: 'g', defaultQuantity: 400, tags: ['funghi', 'risotto'] },
  { name: 'Funghi Porcini Secchi', category: 'verdure', unit: 'g', defaultQuantity: 30, tags: ['porcini', 'risotto'] },
  { name: 'Carciofi', category: 'verdure', unit: 'pz', defaultQuantity: 4, tags: ['carciofi', 'roma'] },
  { name: 'Finocchi', category: 'verdure', unit: 'pz', defaultQuantity: 2, tags: ['finocchi', 'insalata'] },
  { name: 'Fagiolini', category: 'verdure', unit: 'g', defaultQuantity: 500, tags: ['fagiolini', 'contorno'] },
  { name: 'Piselli Surgelati', category: 'verdure', unit: 'g', defaultQuantity: 450, tags: ['piselli', 'surgelati'] },
  { name: 'Basilico Fresco', category: 'verdure', unit: 'mazzetto', defaultQuantity: 1, tags: ['basilico', 'aromatica'] },
  { name: 'Prezzemolo', category: 'verdure', unit: 'mazzetto', defaultQuantity: 1, tags: ['prezzemolo', 'aromatica'] },
  { name: 'Rosmarino', category: 'verdure', unit: 'mazzetto', defaultQuantity: 1, tags: ['rosmarino', 'aromatica'] },
  { name: 'Salvia', category: 'verdure', unit: 'mazzetto', defaultQuantity: 1, tags: ['salvia', 'aromatica'] },

  // === FRUTTA ===
  { name: 'Mele', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['mele', 'frutta'] },
  { name: 'Banane', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['banane', 'frutta'] },
  { name: 'Arance', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['arance', 'agrumi'] },
  { name: 'Limoni', category: 'frutta', unit: 'pz', defaultQuantity: 4, tags: ['limoni', 'agrumi'] },
  { name: 'Fragole', category: 'frutta', unit: 'g', defaultQuantity: 500, tags: ['fragole', 'dolci'] },
  { name: 'Pesche', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['pesche', 'estiva'] },
  { name: 'Uva', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['uva', 'frutta'] },
  { name: 'Pere', category: 'frutta', unit: 'kg', defaultQuantity: 1, tags: ['pere', 'frutta'] },
  { name: 'Kiwi', category: 'frutta', unit: 'pz', defaultQuantity: 4, tags: ['kiwi', 'vitamina c'] },
  { name: 'Melone', category: 'frutta', unit: 'pz', defaultQuantity: 1, tags: ['melone', 'prosciutto'] },
  { name: 'Anguria', category: 'frutta', unit: 'pz', defaultQuantity: 1, tags: ['anguria', 'estate'] },

  // === CONSERVE E SUGHI ===
  { name: 'Passata di Pomodoro', category: 'conserve', unit: 'g', defaultQuantity: 700, tags: ['passata', 'pomodoro'] },
  { name: 'Pomodori Pelati', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['pelati', 'sugo'] },
  { name: 'Polpa di Pomodoro', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['polpa', 'sugo'] },
  { name: 'Concentrato di Pomodoro', category: 'conserve', unit: 'g', defaultQuantity: 200, tags: ['concentrato', 'sugo'] },
  { name: 'Pesto alla Genovese', category: 'conserve', unit: 'g', defaultQuantity: 190, tags: ['pesto', 'basilico'] },
  { name: 'Olive Verdi', category: 'conserve', unit: 'g', defaultQuantity: 300, tags: ['olive', 'aperitivo'] },
  { name: 'Olive Nere', category: 'conserve', unit: 'g', defaultQuantity: 300, tags: ['olive', 'aperitivo'] },
  { name: 'Capperi', category: 'conserve', unit: 'g', defaultQuantity: 100, tags: ['capperi', 'condimento'] },
  { name: 'Sottaceti', category: 'conserve', unit: 'g', defaultQuantity: 300, tags: ['sottaceti', 'antipasto'] },
  { name: 'Carciofini Sottolio', category: 'conserve', unit: 'g', defaultQuantity: 280, tags: ['carciofi', 'antipasto'] },
  { name: 'Fagioli Borlotti', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['fagioli', 'legumi'] },
  { name: 'Fagioli Cannellini', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['fagioli', 'legumi'] },
  { name: 'Ceci', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['ceci', 'legumi'] },
  { name: 'Lenticchie', category: 'conserve', unit: 'g', defaultQuantity: 400, tags: ['lenticchie', 'legumi'] },

  // === OLIO E CONDIMENTI ===
  { name: 'Olio Extravergine di Oliva', category: 'condimenti', unit: 'l', defaultQuantity: 1, tags: ['olio', 'oliva'] },
  { name: 'Olio di Semi', category: 'condimenti', unit: 'l', defaultQuantity: 1, tags: ['olio', 'frittura'] },
  { name: 'Aceto di Vino', category: 'condimenti', unit: 'ml', defaultQuantity: 500, tags: ['aceto', 'insalata'] },
  { name: 'Aceto Balsamico', category: 'condimenti', unit: 'ml', defaultQuantity: 250, tags: ['balsamico', 'modena'] },
  { name: 'Sale Fino', category: 'condimenti', unit: 'kg', defaultQuantity: 1, tags: ['sale', 'base'] },
  { name: 'Sale Grosso', category: 'condimenti', unit: 'kg', defaultQuantity: 1, tags: ['sale', 'pasta'] },
  { name: 'Pepe Nero', category: 'condimenti', unit: 'g', defaultQuantity: 50, tags: ['pepe', 'spezia'] },
  { name: 'Peperoncino', category: 'condimenti', unit: 'g', defaultQuantity: 30, tags: ['peperoncino', 'piccante'] },
  { name: 'Origano', category: 'condimenti', unit: 'g', defaultQuantity: 20, tags: ['origano', 'pizza'] },
  { name: 'Zafferano', category: 'condimenti', unit: 'bustine', defaultQuantity: 3, tags: ['zafferano', 'risotto'] },
  { name: 'Dado Vegetale', category: 'condimenti', unit: 'pz', defaultQuantity: 10, tags: ['dado', 'brodo'] },
  { name: 'Maionese', category: 'condimenti', unit: 'g', defaultQuantity: 250, tags: ['maionese', 'salsa'] },
  { name: 'Senape', category: 'condimenti', unit: 'g', defaultQuantity: 200, tags: ['senape', 'salsa'] },
  { name: 'Ketchup', category: 'condimenti', unit: 'g', defaultQuantity: 400, tags: ['ketchup', 'salsa'] },

  // === FARINA E LIEVITI ===
  { name: 'Farina 00', category: 'farine', unit: 'kg', defaultQuantity: 1, tags: ['farina', 'dolci'] },
  { name: 'Farina Integrale', category: 'farine', unit: 'kg', defaultQuantity: 1, tags: ['farina', 'integrale'] },
  { name: 'Farina Manitoba', category: 'farine', unit: 'kg', defaultQuantity: 1, tags: ['manitoba', 'pizza'] },
  { name: 'Semola di Grano Duro', category: 'farine', unit: 'kg', defaultQuantity: 1, tags: ['semola', 'pasta'] },
  { name: 'Amido di Mais', category: 'farine', unit: 'g', defaultQuantity: 250, tags: ['maizena', 'addensante'] },
  { name: 'Pangrattato', category: 'farine', unit: 'g', defaultQuantity: 500, tags: ['pangrattato', 'impanatura'] },
  { name: 'Lievito di Birra', category: 'farine', unit: 'g', defaultQuantity: 25, tags: ['lievito', 'pane'] },
  { name: 'Lievito per Dolci', category: 'farine', unit: 'g', defaultQuantity: 16, tags: ['lievito', 'torte'] },

  // === DOLCI E COLAZIONE ===
  { name: 'Zucchero', category: 'dolci', unit: 'kg', defaultQuantity: 1, tags: ['zucchero', 'base'] },
  { name: 'Zucchero di Canna', category: 'dolci', unit: 'g', defaultQuantity: 500, tags: ['zucchero', 'integrale'] },
  { name: 'Zucchero a Velo', category: 'dolci', unit: 'g', defaultQuantity: 250, tags: ['zucchero', 'decorazione'] },
  { name: 'Miele', category: 'dolci', unit: 'g', defaultQuantity: 500, tags: ['miele', 'dolcificante'] },
  { name: 'Marmellata', category: 'dolci', unit: 'g', defaultQuantity: 350, tags: ['marmellata', 'colazione'] },
  { name: 'Nutella', category: 'dolci', unit: 'g', defaultQuantity: 400, tags: ['nutella', 'colazione'] },
  { name: 'Cioccolato Fondente', category: 'dolci', unit: 'g', defaultQuantity: 200, tags: ['cioccolato', 'dolci'] },
  { name: 'Cacao Amaro', category: 'dolci', unit: 'g', defaultQuantity: 75, tags: ['cacao', 'tiramisu'] },
  { name: 'Biscotti', category: 'dolci', unit: 'g', defaultQuantity: 350, tags: ['biscotti', 'colazione'] },
  { name: 'Biscotti Digestive', category: 'dolci', unit: 'g', defaultQuantity: 250, tags: ['biscotti', 'cheesecake'] },
  { name: 'Savoiardi', category: 'dolci', unit: 'g', defaultQuantity: 400, tags: ['savoiardi', 'tiramisu'] },
  { name: 'Corn Flakes', category: 'dolci', unit: 'g', defaultQuantity: 500, tags: ['cereali', 'colazione'] },
  { name: 'Muesli', category: 'dolci', unit: 'g', defaultQuantity: 500, tags: ['muesli', 'colazione'] },
  { name: 'Caffè Macinato', category: 'bevande', unit: 'g', defaultQuantity: 250, tags: ['caffè', 'moka'] },
  { name: 'Caffè in Capsule', category: 'bevande', unit: 'pz', defaultQuantity: 16, tags: ['caffè', 'capsule'] },
  { name: 'Tè', category: 'bevande', unit: 'pz', defaultQuantity: 20, tags: ['tè', 'infuso'] },
  { name: 'Colla di Pesce', category: 'dolci', unit: 'g', defaultQuantity: 12, tags: ['gelatina', 'dolci'] },
  { name: 'Vanillina', category: 'dolci', unit: 'bustine', defaultQuantity: 6, tags: ['vaniglia', 'aroma'] },
  { name: 'Amarene Sciroppate', category: 'dolci', unit: 'g', defaultQuantity: 400, tags: ['amarene', 'cheesecake'] },

  // === BEVANDE ===
  { name: 'Acqua Naturale', category: 'bevande', unit: 'l', defaultQuantity: 6, tags: ['acqua', 'naturale'] },
  { name: 'Acqua Frizzante', category: 'bevande', unit: 'l', defaultQuantity: 6, tags: ['acqua', 'frizzante'] },
  { name: 'Succo di Frutta', category: 'bevande', unit: 'l', defaultQuantity: 1, tags: ['succo', 'frutta'] },
  { name: 'Vino Rosso', category: 'bevande', unit: 'l', defaultQuantity: 0.75, tags: ['vino', 'rosso'] },
  { name: 'Vino Bianco', category: 'bevande', unit: 'l', defaultQuantity: 0.75, tags: ['vino', 'bianco'] },
  { name: 'Birra', category: 'bevande', unit: 'ml', defaultQuantity: 660, tags: ['birra', 'aperitivo'] },

  // === SURGELATI ===
  { name: 'Pizza Surgelata', category: 'surgelati', unit: 'pz', defaultQuantity: 1, tags: ['pizza', 'veloce'] },
  { name: 'Spinaci Surgelati', category: 'surgelati', unit: 'g', defaultQuantity: 450, tags: ['spinaci', 'verdure'] },
  { name: 'Minestrone Surgelato', category: 'surgelati', unit: 'g', defaultQuantity: 600, tags: ['minestrone', 'zuppa'] },
  { name: 'Bastoncini di Pesce', category: 'surgelati', unit: 'g', defaultQuantity: 450, tags: ['pesce', 'bambini'] },
  { name: 'Gelato', category: 'surgelati', unit: 'ml', defaultQuantity: 500, tags: ['gelato', 'dolce'] },
];

/**
 * Cerca prodotto per nome (fuzzy match)
 */
export function findProductByName(name: string): ProductData | undefined {
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return PRODUCTS_DATASET.find((p) => {
    const productName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return productName.includes(normalized) || normalized.includes(productName);
  });
}

/**
 * Cerca prodotti per categoria
 */
export function findProductsByCategory(category: string): ProductData[] {
  return PRODUCTS_DATASET.filter((p) => p.category === category);
}

/**
 * Cerca prodotti per tag
 */
export function findProductsByTag(tag: string): ProductData[] {
  return PRODUCTS_DATASET.filter((p) => p.tags.includes(tag.toLowerCase()));
}
