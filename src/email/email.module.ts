import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

@Global() // Hacemos global para no tener que importarlo en cada módulo
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
