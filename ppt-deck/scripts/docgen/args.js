// Minimal --key value argument parser shared by the docgen builders.
module.exports = function parseArgs(required = []) {
  const out = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) throw new Error(`unexpected argument: ${argv[i]}`);
    out[argv[i].slice(2)] = argv[i + 1];
    i++;
  }
  const missing = required.filter((k) => !out[k]);
  if (missing.length) {
    console.error(`missing: ${missing.map((k) => "--" + k).join(" ")}`);
    process.exit(2);
  }
  return out;
};
