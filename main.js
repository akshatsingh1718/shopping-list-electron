const electron = require('electron');
const url = require('url');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const { app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
// process.env.MODE_ENV = 'production';

let focusedwindow = BrowserWindow.getFocusedWindow();
let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function () {
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Inset Menu
    Menu.setApplicationMenu(mainMenu);

    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
});

// Handle create add window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width: 300,
        height:500,
        title:'Add Shopping list item',
        webPreferences:{
            nodeIntegration:true,
             contextIsolation: false
        }
    });

    // Load html into window
    addWindow.loadURL(url.format({
        pathname:path.join(__dirname, 'addWindow.html'),
        protocol:'file:',
        slashes:true
    }));

    // Grabage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    })
}


// catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Fav Items',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'clear items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator : process.platform == 'darwin' ? 
                'command+Q':'ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];


// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.MODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator:'CmdOrCtrl+I',
                click(item, focusedwindow){
                    focusedwindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}




autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});