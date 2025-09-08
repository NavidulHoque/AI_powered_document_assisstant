import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VectorStore } from './vector.store';

@Module({
  providers: [
    PrismaService,
    VectorStore,
    {
      provide: 'IVectorStore',   // token for interface
      useExisting: VectorStore,  // use the same instance
    },
  ],
  exports: ['IVectorStore'],      // export the token for DI
})
export class VectorModule {}
