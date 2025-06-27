const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { spawn } = require('child_process');

let mainWindow;
let tray;
let nextServer;

// 检查并确保托盘存在
function ensureTray() {
  if (!tray || tray.isDestroyed()) {
    console.log('托盘不存在或已销毁，重新创建');
    createTray();
  }
  return tray && !tray.isDestroyed();
}

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
    icon: path.join(__dirname, 'assets', 'icon.png'), // 添加图标
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      // 启用剪贴板访问权限
      experimentalFeatures: true,
      // 允许网页访问剪贴板
      additionalArguments: ['--enable-clipboard-features'],
    },
    show: false, // 先不显示，等加载完成后再显示
    // 隐藏标题栏，让网页内容控制拖拽区域
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    // 设置窗口可拖拽
    movable: true,
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

  // 启用剪贴板快捷键支持
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 允许标准剪贴板快捷键通过
    if (input.control || input.meta) {
      if (input.key === 'c' || input.key === 'v' || input.key === 'x' || input.key === 'a') {
        // 允许这些快捷键正常工作
        return;
      }
    }
  });

    // 窗口关闭时最小化到托盘
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      
      console.log('开始最小化到托盘');
      
      // 确保托盘图标存在
      if (!ensureTray()) {
        console.error('无法创建或恢复托盘图标');
        // 如果托盘创建失败，就不要隐藏窗口
        return;
      }
      
      mainWindow.hide();
      console.log('应用已最小化到托盘');
      
      // 在macOS上，不要隐藏dock图标，这可能会影响托盘显示
      // 只有在真正退出时才隐藏dock
      console.log('窗口已隐藏，托盘图标应该可见');
    }
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function setupApplicationMenu() {
  const template = [
    {
      label: 'Prompt Stash',
      submenu: [
        { 
          label: 'About Prompt Stash', 
          role: 'about' 
        },
        { type: 'separator' },
        { 
          label: 'Hide Prompt Stash', 
          accelerator: 'Command+H', 
          role: 'hide' 
        },
        { 
          label: 'Hide Others', 
          accelerator: 'Command+Alt+H', 
          role: 'hideothers' 
        },
        { 
          label: 'Show All', 
          role: 'unhide' 
        },
        { type: 'separator' },
        { 
          label: 'Exit Prompt Stash', 
          accelerator: 'Command+Q', 
          click: () => {
            app.isQuiting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { 
          label: 'Undo', 
          accelerator: 'CmdOrCtrl+Z', 
          role: 'undo' 
        },
        { 
          label: 'Redo', 
          accelerator: 'Shift+CmdOrCtrl+Z', 
          role: 'redo' 
        },
        { type: 'separator' },
        { 
          label: 'Cut', 
          accelerator: 'CmdOrCtrl+X', 
          role: 'cut' 
        },
        { 
          label: 'Copy', 
          accelerator: 'CmdOrCtrl+C', 
          role: 'copy' 
        },
        { 
          label: 'Paste', 
          accelerator: 'CmdOrCtrl+V', 
          role: 'paste' 
        },
        { 
          label: 'Select All', 
          accelerator: 'CmdOrCtrl+A', 
          role: 'selectall' 
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { 
          label: 'Reload', 
          accelerator: 'CmdOrCtrl+R', 
          click: () => {
            mainWindow.reload();
          }
        },
        { 
          label: 'Force Reload', 
          accelerator: 'CmdOrCtrl+Shift+R', 
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        { 
          label: 'Toggle Developer Tools', 
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I', 
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        { 
          label: 'Actual Size', 
          accelerator: 'CmdOrCtrl+0', 
          role: 'resetZoom' 
        },
        { 
          label: 'Zoom In', 
          accelerator: 'CmdOrCtrl+Plus', 
          role: 'zoomIn' 
        },
        { 
          label: 'Zoom Out', 
          accelerator: 'CmdOrCtrl+-', 
          role: 'zoomOut' 
        },
        { type: 'separator' },
        { 
          label: 'Toggle Fullscreen', 
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11', 
          role: 'togglefullscreen' 
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { 
          label: 'Minimize', 
          accelerator: 'CmdOrCtrl+M', 
          role: 'minimize' 
        },
        { 
          label: 'Close', 
          accelerator: 'CmdOrCtrl+W', 
          role: 'close' 
        }
      ]
    }
  ];

  // Windows和Linux平台需要去掉macOS特有的菜单项
  if (process.platform !== 'darwin') {
    template.shift(); // 移除应用菜单
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  // 创建系统托盘
  let trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  
  // 检查托盘图标文件是否存在
  const fs = require('fs');
  if (!fs.existsSync(trayIconPath)) {
    console.log('托盘图标不存在，使用主图标');
    trayIconPath = path.join(__dirname, 'assets', 'icon.png');
  }
  
  console.log('创建托盘图标，路径:', trayIconPath);
  
  try {
    tray = new Tray(trayIconPath);
    console.log('托盘图标创建成功');
    
    // macOS特殊处理
    if (process.platform === 'darwin') {
      // 设置图标为模板图标以适应系统主题
      tray.setIgnoreDoubleClickEvents(false);
      
      // 在macOS上，确保托盘图标可见
      tray.setPressedImage(trayIconPath);
      
      // 添加一个测试回调来确认托盘是否工作
      setTimeout(() => {
        if (tray && !tray.isDestroyed()) {
          console.log('macOS托盘图标状态正常');
        } else {
          console.log('macOS托盘图标状态异常');
        }
      }, 1000);
    }
  } catch (error) {
    console.error('创建托盘图标失败:', error);
    return;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Prompt Stash',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        console.log('通过托盘菜单显示窗口');
      }
    },
    {
      label: 'Hide to Tray',
      click: () => {
        mainWindow.hide();
        console.log('通过托盘菜单隐藏窗口');
        // 在macOS上不隐藏dock，保持与关闭按钮行为一致
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
      label: 'Exit Application',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Prompt Stash - Local Prompt Manager');
  tray.setContextMenu(contextMenu);
  
  console.log('托盘设置完成');
  
  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    console.log('托盘图标被双击');
    mainWindow.show();
    mainWindow.focus();
  });
  
  // 单击托盘图标（Windows/Linux）
  tray.on('click', () => {
    console.log('托盘图标被单击');
    if (process.platform !== 'darwin') {
      mainWindow.show();
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
    setupApplicationMenu();
    
    console.log('Electron应用已启动');
  });
}

// 所有窗口关闭时的行为
app.on('window-all-closed', () => {
  // 不要自动退出应用，保持在托盘中运行
  // 用户需要通过托盘菜单或快捷键明确退出
  console.log('所有窗口已关闭，应用继续在托盘中运行');
});

app.on('activate', () => {
  // 当dock图标被点击时，显示主窗口
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    // 如果主窗口不存在，重新创建
    createWindow();
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