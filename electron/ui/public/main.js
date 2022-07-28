const { app, BrowserWindow } = require('electron')

const path = require('path')
const isDev = require('electron-is-dev')
const { spawn, execFile, exec } = require("child_process");

require('@electron/remote/main').initialize()

// Python server parameters
const PY_HOST = "127.0.0.1";
const PY_PORT = 8001;
const PY_LOG_LEVEL = "info";

function launchPython() {
    if (isDev) {
      pythonProcess = spawn("uvicorn", 
      [
        "main:app",
        "--host",
        "127.0.0.1",
        "--port",
        PY_PORT,
    ],
    {
        cwd: '../../../backend/app'
    });
    // pythonProcess = spawn("python3", [
    //     "..\\..\\..\\backend\\app\\main.py",
    //     "--host",
    //     PY_HOST,
    //     "--port",
    //     PY_PORT,
    //     "--log-level",
    //     PY_LOG_LEVEL
    //   ]);
      console.log("Python process started in dev mode");
    } else {
      pythonProcess = execFile(
        path.join(__dirname, "../../../py_dist/main/main"),
        [
          "--host",
          PY_HOST,
          "--port",
          PY_PORT,
          "--log-level",
          PY_LOG_LEVEL,
        ]
      );
      console.log("Python process started in built mode");
    }
    return pythonProcess;
  }

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  win.webContents.openDevTools()
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
}

// app.on('ready', createWindow)
app.whenReady().then(() => {
    pythonProcess = launchPython();
    mainWindow = createWindow();
  });

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})