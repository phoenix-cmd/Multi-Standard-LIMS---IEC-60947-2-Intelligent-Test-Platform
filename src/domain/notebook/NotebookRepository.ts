import type { Notebook, NotebookPage, NotebookSearchResult } from './NotebookTypes';

export interface NotebookRepository {
  findById(id: string): Promise<Notebook | null>;
  findAll(): Promise<Notebook[]>;
  findByContext(context: string, contextId?: string): Promise<Notebook[]>;
  save(notebook: Notebook): Promise<Notebook>;
  delete(id: string): Promise<boolean>;
  savePage(notebookId: string, page: NotebookPage): Promise<NotebookPage>;
  deletePage(notebookId: string, pageId: string): Promise<boolean>;
  search(query: string): Promise<NotebookSearchResult[]>;
}

// ── In-Memory Implementation ──────────────────────────────────

export class InMemoryNotebookRepository implements NotebookRepository {
  private _notebooks: Map<string, Notebook> = new Map();

  async findById(id: string): Promise<Notebook | null> {
    return this._notebooks.get(id) ?? null;
  }

  async findAll(): Promise<Notebook[]> {
    return Array.from(this._notebooks.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async findByContext(context: string, contextId?: string): Promise<Notebook[]> {
    return Array.from(this._notebooks.values()).filter(
      (n) => n.context === context && (!contextId || n.contextId === contextId)
    );
  }

  async save(notebook: Notebook): Promise<Notebook> {
    const copy = { ...notebook, pages: notebook.pages.map((p) => ({ ...p })) };
    this._notebooks.set(notebook.id, copy);
    return notebook;
  }

  async delete(id: string): Promise<boolean> {
    return this._notebooks.delete(id);
  }

  async savePage(notebookId: string, page: NotebookPage): Promise<NotebookPage> {
    const nb = this._notebooks.get(notebookId);
    if (!nb) throw new Error(`Notebook ${notebookId} not found`);
    const idx = nb.pages.findIndex((p) => p.id === page.id);
    if (idx >= 0) nb.pages[idx] = { ...page };
    else nb.pages.push({ ...page });
    nb.updatedAt = new Date().toISOString();
    return page;
  }

  async deletePage(notebookId: string, pageId: string): Promise<boolean> {
    const nb = this._notebooks.get(notebookId);
    if (!nb) return false;
    const before = nb.pages.length;
    nb.pages = nb.pages.filter((p) => p.id !== pageId);
    return nb.pages.length < before;
  }

  async search(query: string): Promise<NotebookSearchResult[]> {
    const results: NotebookSearchResult[] = [];
    const lower = query.toLowerCase();

    for (const nb of this._notebooks.values()) {
      for (const page of nb.pages) {
        if (page.title.toLowerCase().includes(lower)) {
          results.push({
            notebookId: nb.id,
            notebookTitle: nb.title,
            pageId: page.id,
            pageTitle: page.title,
            excerpt: page.title,
            score: 10,
          });
        }
        for (const block of page.blocks) {
          const raw = JSON.stringify(block.content).toLowerCase();
          if (raw.includes(lower)) {
            results.push({
              notebookId: nb.id,
              notebookTitle: nb.title,
              pageId: page.id,
              pageTitle: page.title,
              blockId: block.id,
              blockType: block.type,
              excerpt: raw.substring(0, 120),
              score: 5,
            });
          }
        }
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 30);
  }
}

export const globalNotebookRepository = new InMemoryNotebookRepository();
