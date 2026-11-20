import { copyFile } from 'node:fs/promises';

async function tryCopy(fromUrl, toUrl) {
  try {
    await copyFile(fromUrl, toUrl);
    return true;
  } catch (err) {
    return false;
  }
}

// Keep published catalog.html links functional on static hosts.
// Support both Vercel outDir (ui/dist) and repo root outDir (dist).
const vercelFrom = new URL('../dist/catalog/index.html', import.meta.url);
const vercelTo = new URL('../dist/catalog.html', import.meta.url);

const rootFrom = new URL('../../dist/catalog/index.html', import.meta.url);
const rootTo = new URL('../../dist/catalog.html', import.meta.url);

if (await tryCopy(vercelFrom, vercelTo)) {
  console.log('Legacy catalog.html alias retained in ui/dist.');
} else if (await tryCopy(rootFrom, rootTo)) {
  console.log('Legacy catalog.html alias retained in dist.');
} else {
  console.warn('Could not locate catalog/index.html to create legacy alias, skipping.');
}
