import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import type { SchemaReportDto } from '@/core/api/schema';

export type ReportInput = SchemaReportDto;
export type ReportReason = SchemaReportDto['reason'];

export const REPORT_REASONS: ReportReason[] = [
  'fake_or_spam',
  'inappropriate',
  'harassment_or_hate',
  'underage',
  'scam',
  'other',
];

export async function block(userId: string): Promise<void> {
  ensureOk(await api.POST('/v1/blocks', { body: { userId } }));
}

export async function report(input: ReportInput) {
  return unwrap(await api.POST('/v1/reports', { body: input }));
}
