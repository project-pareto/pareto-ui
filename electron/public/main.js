const { app, BrowserWindow, protocol } = require('electron')

const path = require('path')
require('dotenv').config()

const axios = require('axios').default;
const isDev = require('electron-is-dev')
const { spawn, execFile } = require("child_process")

// Python server parameters
const PY_HOST = "127.0.0.1";
const PY_PORT = 8001;
const UI_PORT = 3000;
const PY_LOG_LEVEL = "info";
let uiReady = false

const serverURL = `http://localhost:${PY_PORT}`
const uiURL = `http://localhost:${UI_PORT}`

require('@electron/remote/main').initialize()



function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
    }
  })
  win.webContents.openDevTools()
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  )
}

const startServer = () => {
    if (isDev) {

      // backendProcess = spawn("uvicorn", 
      //   [
      //       "main:app",
      //       "--reload",
      //       "--host",
      //       "127.0.0.1",
      //       "--port",
      //       PY_PORT,
      //   ],
      //   {
      //       cwd: '../backend/app'
      //   }
    // );
    backendProcess = execFile(
      path.join(__dirname, "../py_dist/main/main"),
      [
        "--host",
        PY_HOST,
        "--port",
        PY_PORT,
        "--log-level",
        PY_LOG_LEVEL,
      ]
    );

      console.log("Started in dev mode");
    } else {
      console.log("__dirname is : ")
      console.log(__dirname)
      backendProcess = execFile(
        path.join(__dirname, "../py_dist/main/main"),
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
    return backendProcess;
}


app.whenReady().then(() => {
    // Entry point
    protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = request.url.replace('file:///', '');
      callback(pathname);
    });

    let serverProcess = startServer()
    // let uiProcess = startUI()
    let noTrails = 0
    // Start Window 
    var startUp = (url, appName, spawnedProcess, successFn=null, maxTrials=15) => {
        
        axios.get(url).then(() => {
            console.log(`${appName} is ready at ${url}!`)
            if (successFn) {
                successFn()
            }
        })
        .catch(async () => {
            console.log(`Waiting to be able to connect ${appName} at ${url}...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            noTrails += 1
            if (noTrails < maxTrials) {
                startUp(url, appName, spawnedProcess, successFn, maxTrials)
            }
            else {
                console.error(`Exceeded maximum trials to connect to ${appName}`)
                spawnedProcess.kill('SIGINT')
            }
        });
    };
    startUp(serverURL, 'FastAPI Server', serverProcess, createWindow)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// For windows & linux platforms
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})


