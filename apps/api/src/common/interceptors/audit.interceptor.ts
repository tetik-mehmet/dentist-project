import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

const METHOD_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

// URL'den entity tipini çıkar: /api/patients/123 → Patient
function extractEntityType(url: string): string {
  const segments = url.replace('/api/', '').split('/').filter(Boolean);
  const entity = segments[0] ?? 'unknown';
  return entity.charAt(0).toUpperCase() + entity.slice(1, -1); // patients → Patient
}

function extractEntityId(url: string): string | undefined {
  const segments = url.replace('/api/', '').split('/').filter(Boolean);
  // UUID veya ID gibi görünen ikinci segment
  if (segments[1] && !['upload', 'pay', 'steps', 'static'].includes(segments[1])) {
    return segments[1];
  }
  return undefined;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;
    const action = METHOD_ACTION[method];

    // Yalnızca yazma işlemlerini logla
    if (!action) return next.handle();

    // Auth ve statik dosyaları atla
    const url: string = req.url ?? '';
    if (url.includes('/auth/') || url.includes('/static/')) {
      return next.handle();
    }

    const user = req.user;
    if (!user) return next.handle();

    const entityType = extractEntityType(url);
    const entityId = extractEntityId(url);
    const ipAddress = req.ip ?? req.connection?.remoteAddress;

    return next.handle().pipe(
      tap((responseBody) => {
        // Fire-and-forget — başarılı yanıt sonrası kaydet
        this.auditService
          .log({
            action,
            entityType,
            entityId: entityId ?? responseBody?.id,
            newData: method !== 'DELETE' ? responseBody : undefined,
            ipAddress,
            userId: user.id,
            clinicId: user.clinicId,
          })
          .catch(() => {}); // log hatası ana akışı etkilemesin
      }),
    );
  }
}
