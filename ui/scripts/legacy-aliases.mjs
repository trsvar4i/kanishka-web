import {copyFile} from 'node:fs/promises';
// Keep published catalog.html links functional on static hosts, including query filters.
await copyFile(new URL('../../dist/catalog/index.html',import.meta.url),new URL('../../dist/catalog.html',import.meta.url));
console.log('Legacy catalog.html alias retained.');
