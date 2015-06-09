# dompatch
Patch the DOM in the most efficient way possible.

## Usage

```javascript
var html = '<h1>Hello, World</h1>';
var dom = new DOMParser().parseFromString(html, 'text/html');

dompatch(document, dom);
```
