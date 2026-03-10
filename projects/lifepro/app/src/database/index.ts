import * as SQLite from 'expo-sqlite';

const DB_NAME = 'lifepro.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(db);
  }
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '✓',
      color TEXT NOT NULL DEFAULT '#6366F1',
      frequency TEXT NOT NULL DEFAULT 'daily',
      frequency_days TEXT,
      reminder_time TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_date)
    );

    CREATE INDEX IF NOT EXISTS idx_completions_habit_date
      ON habit_completions(habit_id, completed_date);

    CREATE INDEX IF NOT EXISTS idx_completions_date
      ON habit_completions(completed_date);

    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sleep_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      hours REAL NOT NULL,
      quality INTEGER NOT NULL CHECK(quality >= 1 AND quality <= 5),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS water_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      glasses INTEGER NOT NULL DEFAULT 0,
      target INTEGER NOT NULL DEFAULT 8,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      description TEXT,
      type TEXT NOT NULL DEFAULT 'expense',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// === Habit Queries ===

export async function getAllHabits(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT * FROM habits WHERE is_archived = 0 ORDER BY sort_order ASC, created_at ASC'
  );
}

export async function insertHabit(habit: {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  frequencyDays: string | null;
  reminderTime: string | null;
  category: string;
  sortOrder: number;
}): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO habits (id, name, icon, color, frequency, frequency_days, reminder_time, category, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [habit.id, habit.name, habit.icon, habit.color, habit.frequency,
     habit.frequencyDays, habit.reminderTime, habit.category, habit.sortOrder]
  );
}

export async function updateHabitDb(id: string, updates: Record<string, any>): Promise<void> {
  const database = await getDatabase();
  const fields = Object.keys(updates);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => updates[f]);
  await database.runAsync(
    `UPDATE habits SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
    [...values, id]
  );
}

export async function deleteHabitDb(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

// === Completion Queries ===

export async function getCompletionsForHabit(habitId: string): Promise<string[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ completed_date: string }>(
    'SELECT completed_date FROM habit_completions WHERE habit_id = ? ORDER BY completed_date DESC',
    [habitId]
  );
  return rows.map(r => r.completed_date);
}

export async function getCompletionsForDate(date: string): Promise<{ habit_id: string }[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT habit_id FROM habit_completions WHERE completed_date = ?',
    [date]
  );
}

export async function toggleCompletionDb(
  id: string,
  habitId: string,
  date: string
): Promise<boolean> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
    [habitId, date]
  );

  if (existing) {
    await database.runAsync(
      'DELETE FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
      [habitId, date]
    );
    return false; // uncompleted
  } else {
    await database.runAsync(
      'INSERT INTO habit_completions (id, habit_id, completed_date) VALUES (?, ?, ?)',
      [id, habitId, date]
    );
    return true; // completed
  }
}

// === Mood Queries ===

export async function getMoodForDate(date: string): Promise<any | null> {
  const database = await getDatabase();
  return database.getFirstAsync(
    'SELECT * FROM mood_entries WHERE date = ?',
    [date]
  );
}

export async function upsertMood(
  id: string,
  date: string,
  score: number,
  tags: string[]
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO mood_entries (id, date, score, tags)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET score = ?, tags = ?`,
    [id, date, score, JSON.stringify(tags), score, JSON.stringify(tags)]
  );
}

export async function getMoodHistory(limit: number = 30): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    'SELECT * FROM mood_entries ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

// === Sleep Queries ===

export async function getSleepForDate(date: string): Promise<any | null> {
  const database = await getDatabase();
  return database.getFirstAsync('SELECT * FROM sleep_entries WHERE date = ?', [date]);
}

export async function upsertSleep(id: string, date: string, hours: number, quality: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO sleep_entries (id, date, hours, quality) VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET hours = ?, quality = ?`,
    [id, date, hours, quality, hours, quality]
  );
}

// === Water Queries ===

export async function getWaterForDate(date: string): Promise<any | null> {
  const database = await getDatabase();
  return database.getFirstAsync('SELECT * FROM water_entries WHERE date = ?', [date]);
}

export async function upsertWater(id: string, date: string, glasses: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO water_entries (id, date, glasses) VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET glasses = ?`,
    [id, date, glasses, glasses]
  );
}

// === Transaction Queries ===

export async function getTransactionsForMonth(yearMonth: string): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync(
    "SELECT * FROM transactions WHERE date LIKE ? || '%' ORDER BY date DESC",
    [yearMonth]
  );
}

export async function insertTransaction(tx: {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: string;
  date: string;
}): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO transactions (id, amount, category, description, type, date) VALUES (?, ?, ?, ?, ?, ?)',
    [tx.id, tx.amount, tx.category, tx.description, tx.type, tx.date]
  );
}

export async function deleteTransactionDb(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// === Savings Goals Queries ===

export async function getAllSavingsGoals(): Promise<any[]> {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM savings_goals ORDER BY created_at DESC');
}

export async function insertSavingsGoal(goal: { id: string; name: string; targetAmount: number }): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO savings_goals (id, name, target_amount) VALUES (?, ?, ?)',
    [goal.id, goal.name, goal.targetAmount]
  );
}

export async function updateSavingsGoalAmount(id: string, amount: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [amount, id]);
}
