import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class VectorStore {
  private pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async insertEmbedding(docId: string, text: string, embedding: number[]) {
    await this.pool.query(
      `INSERT INTO document_chunks (doc_id, text, embedding) VALUES ($1, $2, $3)`,
      [docId, text, embedding],
    );
  }

  async search(docId: string, queryEmbedding: number[], k: number) {
    const res = await this.pool.query(
      `SELECT text, embedding <=> $2 as distance
       FROM document_chunks
       WHERE doc_id = $1
       ORDER BY distance ASC
       LIMIT $3`,
      [docId, queryEmbedding, k],
    );
    return res.rows;
  }
}
