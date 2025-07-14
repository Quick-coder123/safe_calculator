// ========== КОНФІГУРАЦІЯ SUPABASE ==========
// Налаштування Supabase
// ВАЖЛИВО: Замініть ці значення на ваші справжні дані з Supabase Dashboard

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

let supabaseClient = null;

// Ініціалізуємо Supabase тільки якщо доступний
function initializeSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
    try {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase ініціалізовано успішно');
      return true;
    } catch (error) {
      console.log('❌ Помилка ініціалізації Supabase:', error);
    }
  } else {
    console.log('⚠️ Supabase не налаштований або не завантажений, використовуємо локальні дані');
  }
  return false;
}

// Функція для збереження/оновлення тарифів у Supabase
async function saveRatesToSupabase(ratesData) {
  if (!supabaseClient) return false;
  
  try {
    const { error } = await supabaseClient
      .from('rates')
      .upsert({ 
        id: 1, // Використовуємо фіксований ID для єдиного рядка тарифів
        data: ratesData,
        updated_at: new Date().toISOString()
      });
      
    if (error) throw error;
    console.log('✅ Тарифи збережені в Supabase');
    return true;
  } catch (error) {
    console.log('❌ Помилка збереження тарифів:', error);
    return false;
  }
}

// Функція для завантаження клієнтів з Supabase
async function loadClientsFromSupabase() {
  if (!supabaseClient) return [];
  
  try {
    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.log('❌ Помилка завантаження клієнтів:', error);
    return [];
  }
}

// Функція для збереження клієнта в Supabase
async function saveClientToSupabase(clientData) {
  if (!supabaseClient) return false;
  
  try {
    const { data, error } = await supabaseClient
      .from('clients')
      .insert([clientData])
      .select();
      
    if (error) throw error;
    console.log('✅ Клієнт збережений в Supabase');
    return data[0];
  } catch (error) {
    console.log('❌ Помилка збереження клієнта:', error);
    return false;
  }
}

// Функція для оновлення клієнта в Supabase
async function updateClientInSupabase(clientId, clientData) {
  if (!supabaseClient) return false;
  
  try {
    const { data, error } = await supabaseClient
      .from('clients')
      .update(clientData)
      .eq('id', clientId)
      .select();
      
    if (error) throw error;
    console.log('✅ Клієнт оновлений в Supabase');
    return data[0];
  } catch (error) {
    console.log('❌ Помилка оновлення клієнта:', error);
    return false;
  }
}

// Функція для видалення клієнта з Supabase
async function deleteClientFromSupabase(clientId) {
  if (!supabaseClient) return false;
  
  try {
    const { error } = await supabaseClient
      .from('clients')
      .delete()
      .eq('id', clientId);
      
    if (error) throw error;
    console.log('✅ Клієнт видалений з Supabase');
    return true;
  } catch (error) {
    console.log('❌ Помилка видалення клієнта:', error);
    return false;
  }
}

// Ініціалізуємо Supabase при завантаженні
document.addEventListener('DOMContentLoaded', () => {
  initializeSupabase();
});
