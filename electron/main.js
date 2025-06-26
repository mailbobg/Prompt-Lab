const { app, BrowserWindow, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');

let mainWindow;
let tray;
let nextServer;

// 启动Next.js开发服务器或使用生产构建
function startNextServer() {
  if (isDev) {
    // 开发模式：外部已经启动了Next.js dev server，这里不需要再启动
    console.log('开发模式：使用外部Next.js服务器');
  }
  // 生产模式会使用Next.js standalone build
}

// 尝试连接到Next.js服务器
async function tryConnectToServer(port) {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: port,
      method: 'GET',
      timeout: 1000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      resolve(false);
    });
    
    req.end();
  });
}

// 查找可用的Next.js端口
async function findNextjsPort() {
  // 如果环境变量指定了端口，优先使用
  if (process.env.NEXTJS_PORT) {
    const port = parseInt(process.env.NEXTJS_PORT);
    console.log(`使用环境变量指定的端口: ${port}`);
    return port;
  }
  
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    console.log(`检查端口 ${port}...`);
    const isAvailable = await tryConnectToServer(port);
    if (isAvailable) {
      console.log(`找到Next.js服务器在端口 ${port}`);
      return port;
    }
  }
  
  return 3000; // 默认端口
}

async function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    show: false, // 先不显示，等加载完成后再显示
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  if (isDev) {
    // 开发模式：查找Next.js服务器端口
    console.log('查找Next.js服务器...');
    const port = await findNextjsPort();
    const url = `http://localhost:${port}`;
    console.log(`连接到: ${url}`);
    
    mainWindow.loadURL(url);
    
    // 开发模式下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：使用静态文件
    const url = `file://${path.join(__dirname, '../out/index.html')}`;
    mainWindow.loadURL(url);
  }

  // 窗口加载完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Electron窗口已显示');
  });

  // 窗口关闭时最小化到托盘而不是退出
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      console.log('应用已最小化到托盘');
      
      // 显示托盘通知
      if (process.platform === 'darwin') {
        app.dock.hide();
      }
    }
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  // 创建系统托盘 - 使用默认图标如果自定义图标不存在
  let trayIconPath;
  try {
    trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  } catch (error) {
    // 如果图标不存在，使用空图标
    trayIconPath = path.join(__dirname, 'assets', 'icon.png');
  }
  
  try {
    tray = new Tray(trayIconPath);
  } catch (error) {
    console.log('无法创建托盘图标，使用默认图标');
    // 使用系统默认图标
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Prompt Stash',
      click: () => {
        mainWindow.show();
        if (process.platform === 'darwin') {
          app.dock.show();
        }
      }
    },
    {
      label: 'Hide to Tray',
      click: () => {
        mainWindow.hide();
        if (process.platform === 'darwin') {
          app.dock.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Open in Browser',
      click: async () => {
        const port = await findNextjsPort();
        shell.openExternal(`http://localhost:${port}`);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Prompt Stash - Local Prompt Manager');
  tray.setContextMenu(contextMenu);
  
  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    mainWindow.show();
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });
}

// 设置应用为单实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 应用准备就绪
  app.whenReady().then(async () => {
    console.log('Electron应用启动中...');
    
    if (!isDev) {
      startNextServer();
    }
    
    await createWindow();
    createTray();
    
    console.log('Electron应用已启动');
  });
}

// 所有窗口关闭时的行为
app.on('window-all-closed', () => {
  // 在macOS上，除非用户明确退出，否则应用会保持激活状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当dock图标被点击且没有其他窗口打开时，重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// 应用退出前清理
app.on('before-quit', () => {
  app.isQuiting = true;
  
  // 停止Next.js服务器
  if (nextServer) {
    nextServer.kill();
  }
});

// 处理证书错误（开发模式）
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// 设置应用安全策略
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
}); 