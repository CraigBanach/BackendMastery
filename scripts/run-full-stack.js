const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const composeFile = path.join(repoRoot, "docker-compose.test.yml");
const testsDir = path.join(repoRoot, "full-stack-integration-tests");

const args = process.argv.slice(2);
const shouldRebuild = args.includes("--rebuild") || args.includes("--restart") || args.includes("--fresh");

const runCommand = (command, commandArgs, options = {}) => {
  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const dockerAvailable = () => {
  const result = spawnSync("docker", ["info"], { stdio: "ignore" });
  return result.status === 0;
};

const tryStartDockerDesktop = () => {
  const platform = process.platform;

  if (platform === "win32") {
    const dockerPath = "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe";
    if (fs.existsSync(dockerPath)) {
      spawnSync("cmd", ["/c", "start", "\"\"", dockerPath], { stdio: "ignore" });
    }
    return;
  }

  if (platform === "darwin") {
    spawnSync("open", ["-a", "Docker"], { stdio: "ignore" });
    return;
  }

  if (platform === "linux") {
    spawnSync("systemctl", ["--user", "start", "docker"], { stdio: "ignore" });
    spawnSync("systemctl", ["start", "docker"], { stdio: "ignore" });
  }
};

const waitForDocker = async (timeoutMs = 60000) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (dockerAvailable()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Docker did not become ready within 60 seconds.");
};

const ensureDocker = async () => {
  if (dockerAvailable()) {
    return;
  }

  tryStartDockerDesktop();
  await waitForDocker();
};

const ensureStack = () => {
  if (shouldRebuild) {
    runCommand("docker", ["compose", "-f", composeFile, "down"]);
    runCommand("docker", ["compose", "-f", composeFile, "up", "-d", "--build"]);
    return;
  }

  runCommand("docker", ["compose", "-f", composeFile, "up", "-d"]);
};

const runTests = () => {
  if (process.platform === "win32") {
    runCommand("cmd", ["/c", "npm", "exec", "--", "playwright", "test"], { cwd: testsDir });
    return;
  }

  runCommand("npm", ["exec", "--", "playwright", "test"], { cwd: testsDir });
};

const main = async () => {
  await ensureDocker();
  ensureStack();
  runTests();
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
