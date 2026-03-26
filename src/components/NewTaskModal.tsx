'use client';

// ── New Task Modal — Monday.com light style ────────────────────────────────
// Opens via a "+" button.  Submits to createTask server action.
// Fields: Address, Task Description, Tech Email (dropdown), Revenue, Budget.

import { useActionState, useState, useEffect, useRef } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { createTask } from '@/app/actions';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NewTaskModalProps {
  techOptions: string[];   // existing tech emails / names from work orders
}

interface ActionState {
  ok:     boolean | null;
  error?: string;
}

const INITIAL: ActionState = { ok: null };

// ── Component ─────────────────────────────────────────────────────────────────
export function NewTaskModal({ techOptions }: NewTaskModalProps) {
  const [open, setOpen]        = useState(false);
  const formRef                = useRef<HTMLFormElement>(null);

  // Wrap createTask to match useActionState's expected signature
  async function action(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const result = await createTask(formData);
    return result;
  }

  const [state, dispatch, isPending] = useActionState<ActionState, FormData>(
    action,
    INITIAL,
  );

  // Close on success
  useEffect(() => {
    if (state.ok === true) {
      setTimeout(() => {
        setOpen(false);
        formRef.current?.reset();
      }, 700);
    }
  }, [state.ok]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        <Plus size={16} />
        New Task
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="modal-backdrop"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="modal-card">

            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid #E1E4E8' }}
            >
              <div>
                <h2 className="text-base font-bold text-gray-900">New Work Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Creates a row in Google Sheets</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} action={dispatch} className="px-6 py-5 flex flex-col gap-4">

              {/* Address */}
              <div>
                <label className="form-label" htmlFor="nt-address">
                  Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="nt-address"
                  name="address"
                  className="form-input"
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>

              {/* Task description */}
              <div>
                <label className="form-label" htmlFor="nt-description">
                  Task <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="nt-description"
                  name="description"
                  className="form-input"
                  placeholder="Describe the work to be done…"
                  rows={3}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Tech email */}
              <div>
                <label className="form-label" htmlFor="nt-tech">Tech / Assigned To</label>
                {techOptions.length > 0 ? (
                  <select id="nt-tech" name="tech" className="form-input">
                    <option value="">— Unassigned —</option>
                    {techOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="__custom__">Enter manually…</option>
                  </select>
                ) : (
                  <input
                    id="nt-tech"
                    name="tech"
                    className="form-input"
                    placeholder="tech@theprimedevelopers.com"
                  />
                )}
              </div>

              {/* Revenue + Budget side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="nt-revenue">Revenue ($)</label>
                  <input
                    id="nt-revenue"
                    name="revenue"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="nt-budget">Budget / Costs ($)</label>
                  <input
                    id="nt-budget"
                    name="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Error / success feedback */}
              {state.ok === false && state.error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
                >
                  {state.error}
                </div>
              )}
              {state.ok === true && (
                <div
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}
                >
                  ✓ Work order created successfully!
                </div>
              )}

              {/* Actions */}
              <div
                className="flex justify-end gap-3 pt-2"
                style={{ borderTop: '1px solid #E1E4E8', marginTop: 4 }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                  style={{ minWidth: 120 }}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
