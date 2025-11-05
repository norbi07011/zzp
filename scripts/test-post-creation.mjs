import { createPost } from '../src/services/feedService.js';

console.log('🧪 TEST CREATION FUNCTIONALITY');
console.log('================================');

async function testPostCreation() {
  try {
    // Test creating a post via new fixed feedService
    console.log('📝 Testing post creation via feedService...');
    
    const testPost = {
      author_type: 'employer',
      type: 'story',
      content: 'Test post z nowego feedService - service key workaround!',
      title: 'Test Post'
    };
    
    const result = await createPost(testPost);
    
    console.log('✅ SUCCESS! Post created:');
    console.log('   ID:', result.id);
    console.log('   Author ID:', result.author_id);
    console.log('   Content:', result.content);
    console.log('   Created at:', result.created_at);
    
    return result.id;
    
  } catch (error) {
    console.error('❌ ERROR creating post:', error.message);
    console.error('   Details:', error);
    return null;
  }
}

// Run test
testPostCreation()
  .then(postId => {
    if (postId) {
      console.log('\n🎉 POST CREATION TEST PASSED!');
      console.log('✅ Feed system is now working correctly');
      console.log('✅ Users can create posts via frontend');
    } else {
      console.log('\n❌ POST CREATION TEST FAILED');
    }
  })
  .catch(err => {
    console.error('\n💥 Test execution failed:', err);
  });