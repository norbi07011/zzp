/**
 * =====================================================
 * CHECK EMPLOYER DATA IN SUPABASE
 * =====================================================
 * Sprawdza czy dane pracodawcy zapisały się w bazie
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkEmployerData() {
  console.log('\n🔍 Sprawdzam dane pracodawców w bazie...\n');

  try {
    // Pobierz wszystkich pracodawców
    const { data: employers, error } = await supabase
      .from('employers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error.message);
      return;
    }

    if (!employers || employers.length === 0) {
      console.log('⚠️  Brak pracodawców w bazie danych');
      return;
    }

    console.log(`✅ Znaleziono ${employers.length} pracodawców:\n`);

    employers.forEach((emp, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Pracodawca #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📌 ID: ${emp.id}`);
      console.log(`👤 Profile ID: ${emp.profile_id}`);
      console.log(`🏢 Nazwa firmy: ${emp.company_name || '❌ BRAK'}`);
      console.log(`📋 KVK: ${emp.kvk_number || '❌ BRAK'}`);
      console.log(`🏭 Branża: ${emp.industry || '❌ BRAK'}`);
      console.log(`👥 Wielkość: ${emp.company_size || '❌ BRAK'}`);
      console.log(`📍 Adres: ${emp.address || '❌ BRAK'}`);
      console.log(`🏙️  Miasto: ${emp.city || '❌ BRAK'}`);
      console.log(`📮 Kod pocztowy: ${emp.postal_code || '❌ BRAK'}`);
      console.log(`🌍 Kraj: ${emp.country || '❌ BRAK'}`);
      console.log(`📧 Email: ${emp.contact_email || '❌ BRAK'}`);
      console.log(`📞 Telefon: ${emp.contact_phone || '❌ BRAK'}`);
      console.log(`👔 Osoba kontaktowa: ${emp.contact_person || '❌ BRAK'}`);
      console.log(`🌐 Website: ${emp.website || '❌ BRAK'}`);
      console.log(`🖼️  Logo: ${emp.logo_url || '❌ BRAK'}`);
      console.log(`📝 Opis: ${emp.description ? emp.description.substring(0, 100) + '...' : '❌ BRAK'}`);
      console.log(`✅ Zweryfikowany: ${emp.verified ? 'TAK ✓' : 'NIE ✗'}`);
      console.log(`⭐ Ocena: ${emp.avg_rating || 0} / 5`);
      console.log(`📊 Oferty pracy: ${emp.total_jobs_posted || 0}`);
      console.log(`👷 Zatrudnienia: ${emp.total_hires || 0}`);
      console.log(`📅 Utworzono: ${new Date(emp.created_at).toLocaleString('pl-PL')}`);
      console.log(`🔄 Zaktualizowano: ${emp.updated_at ? new Date(emp.updated_at).toLocaleString('pl-PL') : 'Nigdy'}`);

      // Subskrypcja
      if (emp.subscription_status) {
        console.log(`\n💳 SUBSKRYPCJA:`);
        console.log(`   Status: ${emp.subscription_status}`);
        console.log(`   Tier: ${emp.subscription_tier || 'BRAK'}`);
        if (emp.subscription_expires_at) {
          console.log(`   Wygasa: ${new Date(emp.subscription_expires_at).toLocaleString('pl-PL')}`);
        }
      }

      // Kompletność profilu
      const fields = [
        emp.company_name,
        emp.kvk_number,
        emp.description,
        emp.industry,
        emp.company_size,
        emp.address,
        emp.city,
        emp.country,
        emp.contact_phone,
        emp.contact_email,
        emp.website,
        emp.logo_url,
      ];
      const filledFields = fields.filter(f => f && String(f).trim().length > 0).length;
      const completion = Math.round((filledFields / fields.length) * 100);
      
      console.log(`\n📊 Kompletność profilu: ${completion}% (${filledFields}/${fields.length} pól)`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
  }
}

// Uruchom
checkEmployerData();
