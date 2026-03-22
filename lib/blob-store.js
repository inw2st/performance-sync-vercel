const { list, put } = require("@vercel/blob");

const SPACE_PREFIX = "sync-spaces/";
const BOOTSTRAP_PATH = "sync-bootstrap/current.json";

function pathnameForSpace(spaceId) {
  return `${SPACE_PREFIX}${spaceId}.json`;
}

async function loadSpace(spaceId) {
  const pathname = pathnameForSpace(spaceId);
  const { blobs = [] } = await list({ prefix: pathname, limit: 100 });
  const exactMatches = blobs
    .filter((blob) => blob.pathname === pathname)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const latest = exactMatches[0];
  if (!latest) {
    return null;
  }

  const response = await fetch(latest.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to read blob (${response.status}).`);
  }

  return response.json();
}

async function saveSpace(spaceId, record) {
  const pathname = pathnameForSpace(spaceId);
  await put(pathname, JSON.stringify(record), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

async function loadBootstrap() {
  const { blobs = [] } = await list({ prefix: BOOTSTRAP_PATH, limit: 100 });
  const exactMatches = blobs
    .filter((blob) => blob.pathname === BOOTSTRAP_PATH)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const latest = exactMatches[0];
  if (!latest) {
    return null;
  }

  const response = await fetch(latest.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to read bootstrap blob (${response.status}).`);
  }

  return response.json();
}

async function saveBootstrap(record) {
  await put(BOOTSTRAP_PATH, JSON.stringify(record), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

module.exports = {
  loadBootstrap,
  loadSpace,
  saveBootstrap,
  saveSpace,
};
