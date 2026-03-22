const { loadBootstrap } = require("../../lib/blob-store");
const { ensureMethod, json } = require("../../lib/http");

module.exports = async function handler(req, res) {
  if (!ensureMethod(req, res, "GET")) {
    return;
  }

  try {
    const bootstrap = await loadBootstrap();
    if (!bootstrap) {
      json(res, 404, { error: "No bootstrap sync space yet." });
      return;
    }

    json(res, 200, bootstrap);
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to load bootstrap state." });
  }
};
