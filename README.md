# verify-image-url

A package to check if a URL is an image URL or not and also get the valid image link, extension and media type from the URL

## Install

```
$ npm i verify-image-url
```

## Example

```js
const { verifyImageURL } = require('verify-image-url');

verifyImageURL('https://example.com/example.png');
// -> { isImage: true, imageURL: 'https://example.com/example.png' }

verifyImageURL('https://example.com/example.png', { timeout: 10000 }); // Sets timeout to 10 seconds, default is 5

verifyImageURL('https://prnt.sc/zr5x84');
// -> { isImage: true, imageURL: 'https://image.prntscr.com/image/vNMXC7Q3RkyJn55LxyvLHA.png' }
// This link is from og:image meta tag since prnt.sc is a site where you can upload screenshots and get the web page url from it which isn't your image link but it's in the meta tag
```
