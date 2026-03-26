import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  return new JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface WorkOrder {
  id: string;
  client: string;
  address: string;
  description: string;
  status: string;
  assignedTech: string;
  date: string;
}

export interface FinanceRow {
  date: string;
  description: string;
  revenue: number;
  costs: number;
  category: string;
}

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------
export async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'WorkOrders!A2:G',
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row) => ({
      id: row[0] ?? '',
      client: row[1] ?? '',
      address: row[2] ?? '',
      description: row[3] ?? '',
      status: row[4] ?? '',
      assignedTech: row[5] ?? '',
      date: row[6] ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch work orders:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Update Task Status
// ---------------------------------------------------------------------------
export async function updateTaskStatus(
  id: string,
  status: string,
): Promise<boolean> {
  try {
    const sheets = getSheets();

    // Find the row with matching ID
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'WorkOrders!A:A',
    });

    const rows = res.data.values;
    if (!rows) return false;

    const rowIndex = rows.findIndex((row) => row[0] === id);
    if (rowIndex === -1) return false;

    // Column E (index 4) = Status — row is 1-indexed + header offset
    const cell = `WorkOrders!E${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: cell,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status]] },
    });

    return true;
  } catch (err) {
    console.error('Failed to update task status:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Create Work Order (New Task)
// ---------------------------------------------------------------------------
export interface NewWorkOrderInput {
  address:     string;
  description: string;
  assignedTech: string;
  revenue:     number;
  costs:       number;
}

export async function createWorkOrder(input: NewWorkOrderInput): Promise<boolean> {
  try {
    const sheets  = getSheets();
    const today   = new Date().toISOString().split('T')[0];
    const id      = `WO-${Date.now().toString(36).toUpperCase()}`;
    // Derive client name from address (first part before comma, or full address)
    const client  = input.address.split(',')[0].trim();

    // Append row to WorkOrders sheet: id, client, address, description, status, assignedTech, date
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range:         'WorkOrders!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          id,
          client,
          input.address,
          input.description,
          'Pending',
          input.assignedTech,
          today,
        ]],
      },
    });

    // Append financial row to Finances sheet: date, description, revenue, costs, category
    if (input.revenue > 0 || input.costs > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range:         'Finances!A:E',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[
            today,
            `Work Order: ${client} — ${input.description}`,
            input.revenue,
            input.costs,
            'Work Order',
          ]],
        },
      });
    }

    return true;
  } catch (err) {
    console.error('Failed to create work order:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------
export async function getFinancials(): Promise<FinanceRow[]> {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Finances!A2:E',
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.map((row) => ({
      date: row[0] ?? '',
      description: row[1] ?? '',
      revenue: parseFloat(row[2]) || 0,
      costs: parseFloat(row[3]) || 0,
      category: row[4] ?? '',
    }));
  } catch (err) {
    console.error('Failed to fetch financials:', err);
    return [];
  }
}
