import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3MDE0NjEsImV4cCI6MjA0NDI3NzQ2MX0.eamCMLj6VhGGftOuWAJ8aWEsUAzCDRFhM5QCJCPxLOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestPosts() {
  try {
    console.log('🚀 Creating test posts without media...');

    // Get first employer for test posts
    const { data: employers, error: employerError } = await supabase
      .from('employers')
      .select('profile_id')
      .limit(1);

    if (employerError || !employers?.length) {
      console.error('❌ No employers found:', employerError);
      return;
    }

    const employerId = employers[0].profile_id;
    console.log('👤 Using employer ID:', employerId);

    const testPosts = [
      {
        author_id: employerId,
        author_type: 'employer',
        type: 'announcement',
        title: 'Test Announcement',
        content: 'Dit is een test announcement zonder media. Gewoon een simpele post om te testen of de basis functionaliteit werkt!'
      },
      {
        author_id: employerId,
        author_type: 'employer',
        type: 'job_offer',
        title: 'Software Developer Gezocht',
        content: 'We zoeken een ervaren software developer voor ons team. Fulltime positie met goede arbeidsvoorwaarden.',
        job_category: 'IT',
        job_location: 'Amsterdam',
        job_salary_min: 3500,
        job_salary_max: 5000
      },
      {
        author_id: employerId,
        author_type: 'employer',
        type: 'story',
        title: 'Succesverhaal',
        content: 'Vandaag hebben we een geweldig project afgerond! Dankzij de inzet van ons hele team hebben we alle deadlines gehaald. 🎉'
      }
    ];

    for (const [index, post] of testPosts.entries()) {
      console.log(`📝 Creating post ${index + 1}:`, post.title);
      
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating post ${index + 1}:`, error);
      } else {
        console.log(`✅ Post ${index + 1} created:`, data.id);
      }
    }

    console.log('🎉 All test posts created!');

    // Verify posts were created
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, content, type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      console.log('📋 Recent posts:');
      posts.forEach(post => {
        console.log(`  - ${post.title || 'Untitled'} (${post.type}) - ${post.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestPosts();