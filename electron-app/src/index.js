const { app, BrowserWindow, Menu, dialog, autoUpdater } = require('electron'); // 引入 Menu 模块
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // Only open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 创建自定义菜单模板
  const template = [
    // {
    //   label: '文件',
    //   submenu: [
    //     { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => console.log('新建文件') },
    //     { type: 'separator' }, // 分隔线
    //     { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
    //   ]
    // },
    // {
    //   label: '编辑',
    //   submenu: [
    //     { label: '剪切', role: 'cut' },
    //     { label: '复制', role: 'copy' },
    //     { label: '粘贴', role: 'paste' }
    //   ]
    // },
    // {
    //   label: '视图',
    //   submenu: [
    //     { label: '重新加载', role: 'reload' },
    //     { label: '强制重新加载', role: 'forceReload' },
    //     { label: '切换开发者工具', role: 'toggleDevTools' },
    //     { type: 'separator' },
    //     { label: '实际大小', role: 'resetZoom' },
    //     { label: '放大', role: 'zoomIn' },
    //     { label: '缩小', role: 'zoomOut' }
    //   ]
    // }
  ];

  // 构建菜单
  const menu = Menu.buildFromTemplate(template);
  // 设置应用程序菜单
  Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Auto-update configuration
  const server = 'https://github.com/chao888/styf_contract_issuance'; // Replace with your GitHub repository URL
  const url = `${server}/update/${process.platform}/${app.getVersion()}`;
  autoUpdater.setFeedURL({ url: url });

  // Check for updates every 5 minutes (adjust as needed)
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 5 * 60 * 1000);

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: '发现新版本，正在下载中...',
      buttons: ['确定']
    });
  });

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['重启', '稍后'],
      title: '应用更新',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '新版本已下载。立即重启以安装更新吗？'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', message => {
    console.error('There was a problem updating the application');
    console.error(message);
    dialog.showErrorBox('更新错误', '检查更新时发生错误：' + message);
  });

  // Initial check for updates when the app starts
  autoUpdater.checkForUpdates();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
