const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let data;
try {
  data = JSON.parse(input);
} catch {
  process.exit(0);
}

const filePath = data.tool_input && data.tool_input.file_path;
if (!filePath) process.exit(0);

const normalized = filePath.replace(/\\/g, "/");
if (!/\/src\/.*\.ts$/.test(normalized)) process.exit(0);

try {
  execSync(`npx eslint --fix "${filePath}"`, {
    cwd: path.join(__dirname, "..", ".."),
    stdio: "inherit",
  });
} catch {
  // eslint exits non-zero when unfixable lint errors remain; don't block the hook on that
}
