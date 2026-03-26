'use server';

import { updateTaskStatus } from '@/lib/google-sheets';
import { revalidatePath } from 'next/cache';

export async function completeTask(id: string) {
  const success = await updateTaskStatus(id, 'COMPLETED');
  revalidatePath('/tech');
  return success;
}

export async function updateStatus(id: string, status: string): Promise<boolean> {
  const success = await updateTaskStatus(id, status);
  revalidatePath('/tech');
  revalidatePath('/admin');
  return success;
}

export async function createTask(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const address     = (formData.get('address')     as string | null)?.trim()   ?? '';
  const description = (formData.get('description') as string | null)?.trim()   ?? '';
  const assignedTech= (formData.get('tech')         as string | null)?.trim()   ?? '';
  const revenue     = parseFloat((formData.get('revenue') as string | null) ?? '0') || 0;
  const costs       = parseFloat((formData.get('budget')  as string | null) ?? '0') || 0;

  if (!address || !description) {
    return { ok: false, error: 'Address and task description are required.' };
  }

  const { createWorkOrder } = await import('@/lib/google-sheets');
  const ok = await createWorkOrder({ address, description, assignedTech, revenue, costs });

  if (ok) {
    revalidatePath('/admin');
    revalidatePath('/tech');
  }

  return ok
    ? { ok: true }
    : { ok: false, error: 'Failed to write to Google Sheets. Check your service account permissions.' };
}
