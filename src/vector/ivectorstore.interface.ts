export interface VectorIndexItem {
    id: string;
    embedding: number[];
    metadata?: Record<string, any>;
}

export interface VectorSearchResult {
    id: string;
    score: number;
    metadata?: Record<string, any>;
}

export interface IVectorStore {
    index(item: VectorIndexItem): Promise<void>;
    search(options: { embedding: number[]; topK: number; filterId?: string }): Promise<VectorSearchResult[]>;
}
