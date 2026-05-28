import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mqssqfrfuxsilbzdizfl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc3NxZnJmdXhzaWxiemRpemZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA0MDEsImV4cCI6MjA5NTU0NjQwMX0.Y2Giv9Kilh126IeiRWWxoA79P1FwI8Pbc6o1C4D4DPc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Iniciando test de inserción con campos _es...");
  
  const mockPhoto = {
    id: "test_photo_" + Date.now(),
    url: "https://example.com/test.jpg",
    title: "Test EN",
    description: "Desc EN",
    title_es: "Test ES",
    description_es: "Desc ES",
    editorialReview_es: "Ed ES",
    suggestedSettings_es: "Set ES",
    sort_order: 999
  };

  const { data, error } = await supabase.from('photos').upsert([mockPhoto]).select();
  
  if (error) {
    console.error("❌ FALLÓ EL TEST DE SUPABASE. Detalles del error:");
    console.error(error);
  } else {
    console.log("✅ ÉXITO! La base de datos aceptó el payload con las traducciones.");
    console.log(data);
    
    // Limpiamos el mock photo
    await supabase.from('photos').delete().eq('id', mockPhoto.id);
    console.log("🧹 Mock photo eliminado.");
  }
}

testInsert();
