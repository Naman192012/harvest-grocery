-- Point Fresh Mozzarella at a locally-hosted image asset (images/mozzarella.jpg,
-- served from the app origin) instead of the original Unsplash URL.
update public.products
set image_url = '/images/mozzarella.jpg'
where slug = 'mozzarella';
