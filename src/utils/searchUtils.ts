import Fuse from 'fuse.js';
import { CSVRow, SearchResult } from '../types';

export class CSVSearcher {
  private fuse: Fuse<CSVRow>;

  constructor(data: CSVRow[]) {
    const options = {
      keys: ['Description'],
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
      distance: 100,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    };

    this.fuse = new Fuse(data, options);
  }

  search(query: string): SearchResult | null {
    if (!query.trim()) {
      return null;
    }

    const results = this.fuse.search(query.trim());
    
    if (results.length === 0) {
      return null;
    }

    // Return the best match (lowest score)
    const bestMatch = results[0];
    return {
      item: bestMatch.item,
      score: bestMatch.score,
      matches: bestMatch.matches
    };
  }

  getAllMatches(query: string, limit: number = 5): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    const results = this.fuse.search(query.trim(), { limit });
    
    return results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches
    }));
  }
}