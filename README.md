# verify-image-url

Verify if a URL is an image or extract the image URL from Open Graph meta tags.

## Install

```
$ npm i verify-image-url
```

## Example

```js
const { verifyImageURL } = require('verify-image-url');

await verifyImageURL('https://example.com/example.png');
// -> { isImage: true, imageURL: 'https://example.com/example.png' }

// HTML page with og:image
await verifyImageURL('https://giveaway.boats');
// -> { isImage: true, imageURL: 'https://giveaway.boats/assets/logo.png' }

// Supports custom timeouts (default: 5s)
await verifyImageURL('https://example.com/example.png', { timeout: 10000 });

// Works with SVGs
await verifyImageURL('https://example.com/example.svg', { allowSVG: true });
// -> { isImage: true, imageURL: 'https://example.com/example.svg' }

// Route through a proxy
await verifyImageURL('https://example.com/example.png', { proxy: { url: 'https://proxy.example.com?url=' } });
// This sends a GET request to https://proxy.example.com?url=https://example.com/example.png

// Proxy with authentication
await verifyImageURL('https://example.com/example.png', { proxy: { url: 'https://proxy.example.com', auth: 'secret' } });
// This sends a POST request to https://proxy.example.com with the JSON body `{ method: 'GET', url: 'https://example.com/example.png' }` along with Authorization header set to 'secret'
```
