export interface SearchResultItem {
  id: string;
  entityType: 'sample' | 'equipment' | 'report' | 'clause' | 'workflow' | 'case' | 'formula';
  title: string;
  subtitle: string;
  snippet: string;
  url: string;
  relevanceScore: number;
}

export class UnifiedSearch {
  private _index: SearchResultItem[] = [];

  setIndex(items: SearchResultItem[]) {
    this._index = items;
  }

  search(query: string): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return this._index
      .map((item) => {
        let score = 0;
        if (item.title.toLowerCase().includes(q)) score += 10;
        if (item.subtitle.toLowerCase().includes(q)) score += 5;
        if (item.snippet.toLowerCase().includes(q)) score += 2;
        if (item.id.toLowerCase().includes(q)) score += 8;
        return { ...item, relevanceScore: score };
      })
      .filter((item) => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const globalUnifiedSearch = new UnifiedSearch();
