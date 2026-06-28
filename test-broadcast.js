import blurt from '@blurtfoundation/blurtjs';

blurt.api.setOptions({ url: 'https://blurt-rpc.saboin.com' });

const postingKey = '5K_DEMO_POSTING_KEY_88921';
const activeUsername = 'cryptomaster';
const parentAuthor = '';
const parentPermlink = 'blurt-139531';
const permlink = 'test-post-' + Date.now();
const title = 'Test Post';
const body = 'This is a test post body';
const jsonMetadata = JSON.stringify({ tags: ['blurt-139531'] });

console.log('Attempting broadcast with dummy/invalid posting key...');

try {
  blurt.broadcast.comment(
    postingKey,
    parentAuthor,
    parentPermlink,
    activeUsername,
    permlink,
    title,
    body,
    jsonMetadata,
    (err, result) => {
      if (err) {
        console.log('Callback received error as expected:', err.message || err);
      } else {
        console.log('Callback succeeded:', result);
      }
    }
  );
} catch (e) {
  console.error('Synchronous error caught:', e.message || e);
}
