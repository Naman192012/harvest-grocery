import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsvganthrnvcnpkzztxe.supabase.co';
const supabaseKey = 'sb_publishable_fpYvUnShWoNHSwlT8nS5Ow_lQ4j3ZBF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteWhitePeaches() {
  try {
    // Check if it exists
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'white-peaches');

    console.log('Found records:', existing?.length || 0);
    if (existing?.length) {
      console.log('Record ID:', existing[0].id);
    }

    // Delete by name as well in case slug is different
    const { data: byName } = await supabase
      .from('products')
      .select('*')
      .eq('name', 'White Peaches');

    console.log('Found by name:', byName?.length || 0);

    if (byName?.length) {
      for (const product of byName) {
        const { error: delError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        if (!delError) console.log('Deleted:', product.id);
      }
    }

    // Delete by slug
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('slug', 'white-peaches');

    if (error) {
      console.error('❌ Error deleting by slug:', error);
    } else {
      console.log('✓ Deleted by slug');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

deleteWhitePeaches();
