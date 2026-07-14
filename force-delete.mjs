import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsvganthrnvcnpkzztxe.supabase.co';
const supabaseKey = 'sb_publishable_fpYvUnShWoNHSwlT8nS5Ow_lQ4j3ZBF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceDelete() {
  try {
    console.log('Step 1: Finding White Peaches...');
    const { data: records } = await supabase
      .from('products')
      .select('id')
      .eq('name', 'White Peaches');

    if (!records?.length) {
      console.log('No records found');
      return;
    }

    console.log(`Found ${records.length} record(s) with ID: ${records[0].id}`);

    console.log('Step 2: Deleting...');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', records[0].id);

    if (error) {
      console.error('Delete error:', error);
      return;
    }

    console.log('Step 3: Verifying deletion...');
    const { data: verify } = await supabase
      .from('products')
      .select('id')
      .eq('name', 'White Peaches');

    if (verify?.length === 0) {
      console.log('✓ Successfully deleted!');
    } else {
      console.log(`⚠️  Still found ${verify?.length} record(s)`);
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

forceDelete();
