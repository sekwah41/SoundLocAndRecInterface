const web_feedback = require('./webview/simplefeedback_display');

const electron = require('electron');
const ipcMain = electron.ipcMain;

web_feedback.setup();

function audioSection({id, path}) {
    console.log(id, path);
}

ipcMain.on('tracking', (event, data) => {
    /*
    * [ { active: true,
    id: 14,
    index: 0,
    rgbValueString: 'rgb(75,192,192)',
    selected: true,
    x: 0.633,
    y: 0.034,
    z: 0.774 },
*/
    for(let i in data) {

    }
});

module.exports = {
    audioSection
};

