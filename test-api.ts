import fetch from 'node-fetch';

async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/articles');
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json() as any[];
      console.log('Data length:', data.length);
    } else {
      console.log('Error:', await res.text());
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testApi();
