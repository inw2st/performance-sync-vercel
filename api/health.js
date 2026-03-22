const { json } = require("../lib/http");

module.exports = async function handler(req, res) {
  json(res, 200, {
    ok: true,
    service: "schoollife-sync",
    now: new Date().toISOString(),
  });
};
