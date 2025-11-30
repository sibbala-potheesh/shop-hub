// scripts/create-deployment-zip.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const archiver = require("archiver");

const PROJECT_NAME = "shop-hub";

async function createDeploymentZip() {
  const rootDir = path.join(__dirname, "..");
  const deploymentZipPath = path.join(
    rootDir,
    `${PROJECT_NAME}-deployment.zip`
  );

  const backendDir = path.join(rootDir, "api");
  const frontendDir = path.join(rootDir, "app");
  const frontendDistDir = path.join(frontendDir, "build");
  const backendPublicDir = path.join(backendDir, "public");
  const tempDir = path.join(rootDir, "deploy-temp");

  if (!fs.existsSync(frontendDir)) throw new Error("Frontend folder not found");
  if (!fs.existsSync(backendDir)) throw new Error("Backend folder not found");

  console.log("Building frontend...");
  execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

  if (!fs.existsSync(frontendDistDir))
    throw new Error("Frontend dist not found");

  console.log("Copying frontend to backend/public...");
  fs.rmSync(backendPublicDir, { recursive: true, force: true });
  fs.mkdirSync(backendPublicDir, { recursive: true });
  fs.cpSync(frontendDistDir, backendPublicDir, { recursive: true });

  const backendPkgPath = path.join(backendDir, "package.json");
  if (!fs.existsSync(backendPkgPath))
    throw new Error("backend/package.json missing");
  const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath));

  console.log("Building backend...");
  if (backendPkg.scripts && backendPkg.scripts.build) {
    execSync("npm run build", {
      cwd: backendDir,
      stdio: "inherit",
      env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    });
  } else {
    console.log("No backend build script found");
  }

  console.log("Creating temporary deployment folder...");
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });

  const backendDistDir = path.join(backendDir, "dist");
  const hasBackendDist = fs.existsSync(backendDistDir);

  if (hasBackendDist) {
    fs.cpSync(backendDistDir, tempDir, { recursive: true });
  } else {
    const exclude = new Set([
      "node_modules",
      "dist",
      ".git",
      "deploy-temp",
      ".env.local",
      ".env.development",
    ]);
    const items = fs.readdirSync(backendDir).filter((i) => !exclude.has(i));
    items.forEach((i) =>
      fs.cpSync(path.join(backendDir, i), path.join(tempDir, i), {
        recursive: true,
      })
    );
  }

  if (fs.existsSync(backendPublicDir)) {
    fs.cpSync(backendPublicDir, path.join(tempDir, "public"), {
      recursive: true,
    });
  }

  console.log("Creating production package.json...");
  const files = fs.readdirSync(tempDir);
  const mainFile =
    backendPkg.main ||
    ["index.js", "server.js", "app.js", "main.js"].find((f) =>
      files.includes(f)
    ) ||
    "index.js";

  const productionPackage = {
    name: backendPkg.name || PROJECT_NAME,
    version: backendPkg.version || "1.0.0",
    main: mainFile,
    scripts: { start: `node ${mainFile}` },
    engines: backendPkg.engines || { node: ">=16.0.0" },
    dependencies: backendPkg.dependencies || {},
  };

  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify(productionPackage, null, 2)
  );

  console.log("Creating deployment zip...");
  await zipFolder(tempDir, deploymentZipPath);

  fs.rmSync(tempDir, { recursive: true, force: true });

  const stats = fs.statSync(deploymentZipPath);
  console.log(
    `Deployment zip ready: ${deploymentZipPath} (${(
      stats.size /
      1024 /
      1024
    ).toFixed(2)} MB)`
  );
}

function zipFolder(srcDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

createDeploymentZip().catch((err) => {
  console.error("Error creating deployment zip:", err);
  process.exit(1);
});
