import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsvganthrnvcnpkzztxe.supabase.co';
const supabaseKey = 'sb_publishable_fpYvUnShWoNHSwlT8nS5Ow_lQ4j3ZBF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  try {
    const { data: bySlug } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'white-peaches');

    const { data: byName } = await supabase
      .from('products')
      .select('*')
      .eq('name', 'White Peaches');

    const { data: featured } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(20);

    console.log('\n=== White Peaches by slug ===');
    console.log('Found:', bySlug?.length || 0);

    console.log('\n=== White Peaches by name ===');
    console.log('Found:', byName?.length || 0);

    console.log('\n=== All featured products ===');
    featured?.forEach((p) => {
      if (p.name.includes('White') || p.name.includes('Peach')) {
        console.log(`⚠️  ${p.name} (${p.slug}) - ID: ${p.id}`);
      }
    });
    console.log(`Total featured: ${featured?.length}`);

  } catch (err) {
    console.error('Exception:', err.message);
  }
}

checkAll();
