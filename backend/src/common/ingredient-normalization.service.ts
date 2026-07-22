import { Injectable } from '@nestjs/common';

export interface NormalizedIngredient {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface ListItem extends NormalizedIngredient {
  isDone: boolean;
}

export interface AllergenFlag {
  item: ListItem;
  allergens: string[];
}

export interface AllergenFilterResult {
  safe: ListItem[];
  flagged: AllergenFlag[];
}

/**
 * EU 14 major allergens + common Italian dietary restrictions.
 * Keys are the allergen names used in user preferences.
 * Values are ingredient name fragments (Italian) that trigger the allergen.
 */
const ALLERGEN_MAP: Record<string, string[]> = {
  glutine:          ['farina', 'semola', 'spaghetti', 'pasta', 'pane', 'grissini', 'tonnarelli', 'rigatoni', 'lasagne', 'gnocchi', 'orzo', 'farro', 'bulgur', 'cous', 'crackers', 'pangrattato'],
  uova:             ['uova', 'uovo'],
  latticini:        ['latte', 'burro', 'panna', 'parmigiano', 'pecorino', 'mozzarella', 'ricotta', 'grana', 'formaggio', 'yogurt', 'mascarpone', 'provolone', 'scamorza'],
  'frutta a guscio':['mandorle', 'noci', 'nocciole', 'anacardi', 'pistacchi', 'pinoli', 'castagne', 'noci pecan'],
  arachidi:         ['arachidi', 'burro di arachidi'],
  soia:             ['soia', 'tofu', 'edamame', 'tempeh', 'miso'],
  sesamo:           ['sesamo', 'tahini'],
  pesce:            ['tonno', 'salmone', 'merluzzo', 'branzino', 'orata', 'acciughe', 'sardine', 'baccalà', 'trota', 'pesce spada', 'filetti di pesce'],
  molluschi:        ['polpo', 'calamari', 'seppie', 'cozze', 'vongole', 'ostriche', 'lumache di mare'],
  crostacei:        ['gamberi', 'scampi', 'astice', 'granchio', 'mazzancolle', 'aragosta'],
  sedano:           ['sedano'],
  senape:           ['senape'],
  lupini:           ['lupini'],
};

@Injectable()
export class IngredientNormalizationService {

  /**
   * Converts a quantity + unit pair to a canonical unit.
   * All mass values → g, all volume values → ml, piece aliases → pz.
   */
  normalizeUnit(quantity: number, unit: string): { quantity: number; unit: string } {
    switch (unit.toLowerCase().trim()) {
      // Mass → g
      case 'kg':  return { quantity: quantity * 1000, unit: 'g' };
      case 'mg':  return { quantity: quantity / 1000, unit: 'g' };
      // Volume → ml
      case 'l': case 'lt': case 'litro': case 'litri':
        return { quantity: quantity * 1000, unit: 'ml' };
      case 'dl': return { quantity: quantity * 100,  unit: 'ml' };
      case 'cl': return { quantity: quantity * 10,   unit: 'ml' };
      case 'cucchiaio': case 'cucchiai': case 'tbsp':
        return { quantity: quantity * 15, unit: 'ml' };
      case 'cucchiaino': case 'cucchiaini': case 'tsp':
        return { quantity: quantity * 5,  unit: 'ml' };
      case 'tazza': case 'tazze': case 'cup': case 'cups':
        return { quantity: quantity * 240, unit: 'ml' };
      // Piece aliases → pz
      case 'pezzo': case 'pezzi': case 'piece': case 'pieces':
      case 'spicchio': case 'spicchi':
      case 'foglia': case 'foglie':
      case 'rametto': case 'rametti':
      case 'fetta': case 'fette':
      case 'mazzo': case 'mazzi':
        return { quantity, unit: 'pz' };
      default:
        return { quantity, unit: unit.toLowerCase().trim() };
    }
  }

  /**
   * Merges a list of incoming ingredients into an existing list.
   * - Same ingredient name (case-insensitive) + compatible unit → quantities are summed.
   * - Incompatible units (e.g. g vs pz) → kept as separate entries.
   * - Quantities are rounded to 2 decimal places.
   * - isDone flag on existing items is preserved.
   */
  mergeItems(existing: ListItem[], incoming: NormalizedIngredient[]): ListItem[] {
    const merged: ListItem[] = existing.map(i => ({ ...i }));

    for (const item of incoming) {
      const inNorm = this.normalizeUnit(item.quantity, item.unit);
      const idx = merged.findIndex(
        m =>
          m.ingredient.toLowerCase() === item.ingredient.toLowerCase() &&
          this.normalizeUnit(m.quantity, m.unit).unit === inNorm.unit,
      );

      if (idx >= 0) {
        const exNorm = this.normalizeUnit(merged[idx].quantity, merged[idx].unit);
        merged[idx] = {
          ...merged[idx],
          quantity: Math.round((exNorm.quantity + inNorm.quantity) * 100) / 100,
          unit: inNorm.unit,
        };
      } else {
        merged.push({ ...item, quantity: inNorm.quantity, unit: inNorm.unit, isDone: false });
      }
    }

    return merged;
  }

  /**
   * Returns the allergen categories (from ALLERGEN_MAP) that an ingredient belongs to.
   */
  detectAllergens(ingredientName: string): string[] {
    const lower = ingredientName.toLowerCase();
    return Object.entries(ALLERGEN_MAP)
      .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
      .map(([allergen]) => allergen);
  }

  /**
   * Splits a list into safe items and flagged items for a given set of user allergens.
   * Returns all items as safe when userAllergens is empty.
   */
  filterByAllergens(items: ListItem[], userAllergens: string[]): AllergenFilterResult {
    if (!userAllergens.length) return { safe: [...items], flagged: [] };

    const normalizedUserAllergens = userAllergens.map(a => a.toLowerCase());
    const safe: ListItem[] = [];
    const flagged: AllergenFlag[] = [];

    for (const item of items) {
      const detected = this.detectAllergens(item.ingredient).filter(a =>
        normalizedUserAllergens.includes(a.toLowerCase()),
      );
      if (detected.length > 0) {
        flagged.push({ item, allergens: detected });
      } else {
        safe.push(item);
      }
    }

    return { safe, flagged };
  }
}
