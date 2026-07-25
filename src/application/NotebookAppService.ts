import type {
  Notebook,
  NotebookPage,
  NotebookBlock,
  NotebookContext,
  NotebookTemplateId,
  LinkedArtifact,
  ArtifactType,
  NotebookBlockContent,
  NotebookBlockType,
} from '../domain/notebook/NotebookTypes';
import { globalNotebookRepository } from '../domain/notebook/NotebookRepository';
import { globalNotebookTemplateEngine } from '../intelligence/notebook/NotebookTemplateEngine';
import { globalEventBus } from '../core/events/EventBus';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class NotebookAppService {
  async createNotebook(
    title: string,
    context: NotebookContext,
    author: string,
    options?: { description?: string; contextId?: string; templateId?: NotebookTemplateId; tags?: string[] }
  ): Promise<Notebook> {
    const now = new Date().toISOString();
    let pages: NotebookPage[] = [];

    if (options?.templateId) {
      const tpl = globalNotebookTemplateEngine.getById(options.templateId);
      if (tpl) {
        pages = tpl.defaultPages.map((p) => ({
          id: uid(),
          notebookId: '',
          title: p.title,
          blocks: p.blocks.map((b) => ({
            ...b,
            id: uid(),
            createdAt: now,
            updatedAt: now,
            author,
          })),
          tags: [],
          status: 'draft' as const,
          createdAt: now,
          updatedAt: now,
          version: 1,
          history: [],
        }));
      }
    }

    if (pages.length === 0) {
      pages = [
        {
          id: uid(),
          notebookId: '',
          title: 'Page 1',
          blocks: [],
          tags: [],
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          version: 1,
          history: [],
        },
      ];
    }

    const id = uid();
    pages.forEach((p) => { p.notebookId = id; });

    const notebook: Notebook = {
      id,
      title,
      description: options?.description,
      context,
      contextId: options?.contextId,
      pages,
      linkedArtifacts: [],
      timeline: [
        {
          id: uid(),
          action: 'Notebook Created',
          detail: options?.templateId ? `From template: ${options.templateId}` : 'Blank notebook',
          actor: author,
          timestamp: now,
          icon: '📓',
        },
      ],
      tags: options?.tags ?? [],
      author,
      createdAt: now,
      updatedAt: now,
    };

    await globalNotebookRepository.save(notebook);
    globalEventBus.emit('notebook:created', { notebookId: id, title, author, context });
    return notebook;
  }

  async addPage(notebookId: string, title: string, author: string): Promise<NotebookPage> {
    const nb = await globalNotebookRepository.findById(notebookId);
    if (!nb) throw new Error(`Notebook ${notebookId} not found`);

    const now = new Date().toISOString();
    const page: NotebookPage = {
      id: uid(),
      notebookId,
      title,
      blocks: [],
      tags: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      version: 1,
      history: [],
    };

    nb.pages.push(page);
    nb.timeline.push({ id: uid(), action: 'Page Added', detail: `"${title}" page created`, actor: author, timestamp: now, icon: '📄' });
    await globalNotebookRepository.save(nb);
    return page;
  }

  async addBlock(
    notebookId: string,
    pageId: string,
    type: NotebookBlockType,
    content: NotebookBlockContent,
    author: string
  ): Promise<NotebookBlock> {
    const nb = await globalNotebookRepository.findById(notebookId);
    if (!nb) throw new Error(`Notebook ${notebookId} not found`);
    const page = nb.pages.find((p) => p.id === pageId);
    if (!page) throw new Error(`Page ${pageId} not found`);

    const now = new Date().toISOString();
    const block: NotebookBlock = { id: uid(), type, content, createdAt: now, updatedAt: now, author };
    page.blocks.push(block);
    page.updatedAt = now;
    nb.updatedAt = now;
    nb.timeline.push({ id: uid(), action: 'Block Added', detail: `${type} block added to "${page.title}"`, actor: author, timestamp: now, icon: '➕' });

    await globalNotebookRepository.save(nb);
    return block;
  }

  async updateBlock(
    notebookId: string,
    pageId: string,
    blockId: string,
    content: NotebookBlockContent,
    author: string
  ): Promise<void> {
    const nb = await globalNotebookRepository.findById(notebookId);
    if (!nb) return;
    const page = nb.pages.find((p) => p.id === pageId);
    if (!page) return;
    const block = page.blocks.find((b) => b.id === blockId);
    if (!block) return;

    block.content = content;
    block.updatedAt = new Date().toISOString();
    page.updatedAt = block.updatedAt;
    nb.updatedAt = block.updatedAt;
    nb.timeline.push({ id: uid(), action: 'Block Updated', detail: `${block.type} block edited`, actor: author, timestamp: block.updatedAt, icon: '✏️' });

    await globalNotebookRepository.save(nb);
  }

  async linkArtifact(
    notebookId: string,
    artifactId: string,
    type: ArtifactType,
    title: string,
    linkedBy: string,
    subtitle?: string
  ): Promise<void> {
    const nb = await globalNotebookRepository.findById(notebookId);
    if (!nb) return;
    const already = nb.linkedArtifacts.some((a) => a.id === artifactId && a.type === type);
    if (already) return;

    const artifact: LinkedArtifact = { id: artifactId, type, title, subtitle, linkedAt: new Date().toISOString(), linkedBy };
    nb.linkedArtifacts.push(artifact);
    nb.updatedAt = artifact.linkedAt;
    nb.timeline.push({ id: uid(), action: 'Artifact Linked', detail: `${type}: "${title}"`, actor: linkedBy, timestamp: artifact.linkedAt, icon: '🔗' });

    await globalNotebookRepository.save(nb);
    globalEventBus.emit('notebook:artifact-linked', { notebookId, artifactId, type });
  }

  async getAll(): Promise<Notebook[]> {
    return globalNotebookRepository.findAll();
  }

  async getById(id: string): Promise<Notebook | null> {
    return globalNotebookRepository.findById(id);
  }

  async deleteNotebook(id: string): Promise<void> {
    await globalNotebookRepository.delete(id);
    globalEventBus.emit('notebook:deleted', { notebookId: id });
  }
}

export const globalNotebookService = new NotebookAppService();
