import { SupabaseTest } from '@/components/admin/SupabaseTest';
import { SupabaseTestUI } from '@/components/admin/SupabaseTestUI';

export default async function SupabaseTestPage() {
  const status = await SupabaseTest();
  
  return <SupabaseTestUI status={status} />;
}
