# Калькулятор оренди сейфу

## Налаштування Supabase

### 1. Створення проекту Supabase

1. Перейдіть на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Отримайте URL проекту та анонімний ключ з розділу "Settings" > "API"

### 2. Налаштування бази даних

Виконайте наступні SQL команди в Supabase SQL Editor:

```sql
-- Таблиця для тарифів
CREATE TABLE rates (
  id BIGINT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для клієнтів
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ipn TEXT,
  iban TEXT,
  phone TEXT,
  email TEXT,
  safes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Налаштування Row Level Security (RLS)
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Політики для публічного доступу (можете налаштувати під свої потреби)
CREATE POLICY "Enable read access for all users" ON rates FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON rates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON rates FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON clients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON clients FOR DELETE USING (true);
```

### 3. Налаштування конфігурації

1. Відкрийте файл `supabase-config.js`
2. Замініть значення:
   ```javascript
   const SUPABASE_URL = 'https://your-project-ref.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
   на ваші справжні дані з Supabase Dashboard

### 4. Імпорт початкових даних

Після налаштування можете імпортувати дані з `rates.json` в Supabase:

```sql
INSERT INTO rates (data) VALUES ('{
  "dailyRates": [
    {"rates": {"1 категорія": 15, "2 категорія": 20, "3 категорія": 25, "4 категорія": 30, "5 категорія": 35}},
    {"rates": {"1 категорія": 12, "2 категорія": 16, "3 категорія": 20, "4 категорія": 24, "5 категорія": 28}},
    {"rates": {"1 категорія": 10, "2 категорія": 13, "3 категорія": 16, "4 категорія": 19, "5 категорія": 22}},
    {"rates": {"1 категорія": 8, "2 категорія": 10, "3 категорія": 12, "4 категорія": 14, "5 категорія": 16}}
  ],
  "insuranceRates": [
    {"cost": 500},
    {"cost": 400},
    {"cost": 300},
    {"cost": 250}
  ],
  "attorneyTariff": 150,
  "packetTariff": 25,
  "depositAmount": 1000
}');
```

## Локальна робота

Якщо Supabase не налаштований, система автоматично використовуватиме локальні файли:
- `rates.json` для тарифів
- `clients.json` для клієнтів

## Функції

- ✅ Калькулятор оренди сейфу
- ✅ Управління клієнтами
- ✅ Автоматичне збереження в Supabase або локально
- ✅ Темна/світла тема
- ✅ Багатомовність (UA/EN)
- ✅ Адаптивний дизайн
