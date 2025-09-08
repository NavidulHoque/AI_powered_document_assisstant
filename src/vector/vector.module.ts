import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VectorStore } from './vector.store';

@Global()
@Module({
  providers: [
    PrismaService,
    VectorStore,
    {
      provide: 'IVectorStore',
      useExisting: VectorStore,  
    },
  ],
  exports: ['IVectorStore'],     
})
export class VectorModule {}
