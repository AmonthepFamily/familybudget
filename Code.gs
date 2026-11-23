/**
 * บ้านเรา Budget — Google Apps Script Backend (Code.gs)
 * เชื่อมต่อกับเว็บแอปบน GitHub Pages (index.html) ผ่าน Google Sheets
 * รองรับ GET สำหรับโหลดข้อมูล (ป้องกันปัญหา Load failed บน iPhone Safari / LINE)
 * และเก็บข้อมูลทั้งแบบ JSON Snapshot + ตาราง Transactions ที่อ่านง่ายใน Google Sheets
 */

const SHEET_STATE = 'AppState';
const SHEET_TX = 'Transactions';
const SHEET_BILLS = 'Bills';
const SHEET_MEMBERS = 'Members';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getState';
    if (action === 'getState') {
      const state = readStateFromSheet_();
      return jsonResponse_({ status: 'ok', data: state });
    }
    return jsonResponse_({ status: 'ok', message: 'BaanRao Family Budget API is running' });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: String(err) });
  }
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const payload = JSON.parse(raw);
    if (payload.action === 'saveState' && payload.data) {
      writeStateToSheet_(payload.data);
      syncReadableSheets_(payload.data);
      return jsonResponse_({ status: 'ok', savedAt: new Date().toISOString() });
    }
    return jsonResponse_({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return jsonResponse_({ status: 'error', message: String(err) });
  }
}

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function readStateFromSheet_() {
  const sh = getOrCreateSheet_(SHEET_STATE, ['UpdatedAt', 'StateJSON']);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return null;
  const raw = sh.getRange(2, 2).getValue();
  if (!raw) return null;
  return JSON.parse(raw);
}

function writeStateToSheet_(data) {
  const sh = getOrCreateSheet_(SHEET_STATE, ['UpdatedAt', 'StateJSON']);
  sh.getRange(2, 1, 1, 2).setValues([[new Date().toISOString(), JSON.stringify(data)]]);
}

/**
 * อัปเดตแท็บ Transactions, Bills และ Members ให้อ่านและสรุปผลใน Google Sheets ได้โดยตรง
 */
function syncReadableSheets_(data) {
  // 1. Transactions
  const txSh = getOrCreateSheet_(SHEET_TX, ['ID', 'Date', 'Type', 'Category', 'Member', 'Note', 'Amount']);
  const catMap = {};
  (data.categories || []).forEach(c => { catMap[c.id] = c.name; });
  const memMap = {};
  (data.members || []).forEach(m => { memMap[m.id] = m.name; });

  if (txSh.getLastRow() > 1) {
    txSh.getRange(2, 1, txSh.getLastRow() - 1, 7).clearContent();
  }
  const txRows = (data.transactions || []).map(t => [
    t.id || '',
    t.date || '',
    t.type === 'income' ? 'รายรับ' : (t.type === 'saving' ? 'ออมเงิน' : 'รายจ่าย'),
    catMap[t.categoryId] || t.categoryId || '',
    memMap[t.memberId] || t.memberId || '',
    t.note || '',
    Number(t.amount) || 0
  ]);
  if (txRows.length) {
    txSh.getRange(2, 1, txRows.length, 7).setValues(txRows);
  }

  // 2. Bills
  const billSh = getOrCreateSheet_(SHEET_BILLS, ['ID', 'BillName', 'Amount', 'DueDay', 'Variable', 'AutoPay', 'PaidMonths']);
  if (billSh.getLastRow() > 1) {
    billSh.getRange(2, 1, billSh.getLastRow() - 1, 7).clearContent();
  }
  const billRows = (data.bills || []).map(b => [
    b.id || '',
    b.name || '',
    Number(b.amount) || 0,
    Number(b.dueDay) || 1,
    b.variable ? 'ใช่' : 'ไม่',
    b.autoPay ? 'ใช่' : 'ไม่',
    (b.paidMonths || []).join(', ')
  ]);
  if (billRows.length) {
    billSh.getRange(2, 1, billRows.length, 7).setValues(billRows);
  }

  // 3. Members
  const memSh = getOrCreateSheet_(SHEET_MEMBERS, ['ID', 'Name', 'Role', 'ShareDetails', 'ShareIncome']);
  if (memSh.getLastRow() > 1) {
    memSh.getRange(2, 1, memSh.getLastRow() - 1, 5).clearContent();
  }
  const memRows = (data.members || []).map(m => [
    m.id || '',
    m.name || '',
    m.role || '',
    m.shareDetails ? 'แชร์' : 'ซ่อนรายละเอียด',
    m.shareIncome ? 'แชร์' : 'ซ่อนรายรับ'
  ]);
  if (memRows.length) {
    memSh.getRange(2, 1, memRows.length, 5).setValues(memRows);
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
