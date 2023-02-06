# verify-image-url

A package to check if a URL is an image URL or not and also get the valid image link from it

## Install

```
$ npm i verify-image-url
```

## Example

```js
const { verifyImageURL } = require('verify-image-url');

await verifyImageURL('https://example.com/example.png');
// -> { isImage: true, imageURL: 'https://example.com/example.png' }

await verifyImageURL('https://example.com/example.png', { timeout: 10000 }); // Sets timeout to 10 seconds, default is 5

await verifyImageURL('https://prnt.sc/zrfn0r');
// -> { isImage: true, imageURL: 'https://image.prntscr.com/image/-ndZGuDMRfu7oDAR-fESzg.png' }
// This link is from og:image meta tag since prnt.sc is a site where you can upload screenshots and get the web page url from it which isn't your image link but it's in the meta tag

// Also works with SVGs
await verifyImageURL('https://example.com/example.svg', { allowSVG: true });
// -> { isImage: true, imageURL: 'https://example.com/example.svg' }
```
