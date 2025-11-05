import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Sprawdzam dane społecznościowe...\n');

// Check posts
const { data: posts, error: postsError } = await supabase
  .from('posts')
  .select('id, content, created_at')
  .limit(5);

console.log('📝 POSTY:');
if (postsError) {
  console.log('❌ Błąd:', postsError.message);
} else {
  console.log(`✅ Znaleziono ${posts?.length || 0} postów`);
  if (posts && posts.length > 0) {
    posts.forEach(p => console.log(`  - ${p.content?.substring(0, 50)}...`));
  }
}

// Check post_likes
const { data: likes, error: likesError } = await supabase
  .from('post_likes')
  .select('id, post_id, user_id')
  .limit(5);

console.log('\n❤️ LAJKI:');
if (likesError) {
  console.log('❌ Błąd:', likesError.message);
} else {
  console.log(`✅ Znaleziono ${likes?.length || 0} lajków`);
}

// Check reviews
const { data: reviews, error: reviewsError } = await supabase
  .from('reviews')
  .select('id, rating, review_text, created_at')
  .limit(5);

console.log('\n⭐ OPINIE:');
if (reviewsError) {
  console.log('❌ Błąd:', reviewsError.message);
} else {
  console.log(`✅ Znaleziono ${reviews?.length || 0} opinii`);
  if (reviews && reviews.length > 0) {
    reviews.forEach(r => console.log(`  - Rating: ${r.rating}/5 - ${r.review_text?.substring(0, 50)}...`));
  }
}

// Check post_comments
const { data: comments, error: commentsError } = await supabase
  .from('post_comments')
  .select('id, comment_text')
  .limit(5);

console.log('\n💬 KOMENTARZE:');
if (commentsError) {
  console.log('❌ Błąd:', commentsError.message);
} else {
  console.log(`✅ Znaleziono ${comments?.length || 0} komentarzy`);
}

console.log('\n' + '='.repeat(50));
console.log('PODSUMOWANIE:');
console.log('='.repeat(50));
console.log(`Posty: ${posts?.length || 0}`);
console.log(`Lajki: ${likes?.length || 0}`);
console.log(`Opinie: ${reviews?.length || 0}`);
console.log(`Komentarze: ${comments?.length || 0}`);
