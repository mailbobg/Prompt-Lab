#!/usr/bin/env node

const { spawn } = require("child_process");
const http = require("http");

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: "localhost",
      port: port,
      method: "GET",
      timeout: 1000
    }, (res) => {
      resolve(true);
    });
    
    req.on("error", () => resolve(false));
    req.on("timeout", () => resolve(false));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findNextjsServer() {
  const ports = [3000, 3001, 3002, 3003];
  
  for (let i = 0; i < 30; i++) {
    for (const port of ports) {
      const isRunning = await checkPort(port);
      if (isRunning) {
        console.log(`������Next.js������������������ ${port}`);
        return port;
      }
    }
    console.log(`������Next.js���������������... (${i + 1}/30)`);
    await sleep(1000);
  }
  
  throw new Error("Next.js���������������������");
}

async function main() {
  console.log("������Prompt Stash������������...");
  
  const nextProcess = spawn("npm", ["run", "dev"], {
    stdio: "pipe",
    shell: true
  });
  
  nextProcess.stdout.on("data", (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });
  
  nextProcess.stderr.on("data", (data) => {
    console.log(`[Next.js Error] ${data.toString().trim()}`);
  });
  
  try {
    const port = await findNextjsServer();
    
    console.log("������Electron������...");
    const electronProcess = spawn("electron", ["."], {
      stdio: "inherit",
      shell: true,
      env: { 
        ...process.env, 
        NODE_ENV: "development",
        NEXTJS_PORT: port
      }
    });
    
    electronProcess.on("close", (code) => {
      console.log(`Electron���������������������: ${code}`);
      nextProcess.kill();
      process.exit(code);
    });
    
    nextProcess.on("close", (code) => {
      console.log(`Next.js������������������������: ${code}`);
      electronProcess.kill();
      process.exit(code);
    });
    
    process.on("SIGINT", () => {
      console.log("������������������...");
      nextProcess.kill();
      electronProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error("������������:", error.message);
    nextProcess.kill();
    process.exit(1);
  }
}

main().catch(console.error);
