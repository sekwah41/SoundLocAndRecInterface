const web_feedback = require('./webview/simplefeedback_display');

const electron = require('electron');
const ipcMain = electron.ipcMain;
const fetch = require('node-fetch');

let soundArray = [];
let idToIndex = {

};

class TrackedSound {
    constructor() {
        this.label = "";
        this.angle = 0;
        this.probability = 0;
        this.show = false;

        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    calculateAngle() {
        this.angle = Math.atan2(this.x, this.y) * (180/Math.PI);
    }

}

for(let i = 0; i < 4; i++) {
    soundArray.push(new TrackedSound());
}

web_feedback.setup();

/**
 * Called when a sound sample is finished recording
 * @param id
 * @param path
 */
function audioSection({id, path}) {
    //console.log(id, path);
    let requestBody = {
        "file_loc": path
    };

    //console.log(JSON.stringify(requestBody));

    if(idToIndex[id] !== undefined) {
        let sound = soundArray[idToIndex[id]];
        fetch('http://localhost:5000/predict',
            {
                method: 'post',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.json())
            .then(json => {
                console.log(json);
                sound.label = json['predicted_classes'][0];
                sound.probability = json['probabilities'][sound.label];
            });
    }
}

/**
 * triggered when tracking updates occour.
 */
ipcMain.on('tracking', (event, data) => {

    //console.log(data);
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
    idToIndex = {};

    for(let sound of data) {
        let trackedSound = soundArray[sound.index];
        if(sound.id) {
            idToIndex[sound.id] = sound.index;
            trackedSound.show = true;
        }
        else {
            trackedSound.label = "";
            trackedSound.show = false;
        }

        trackedSound.x = sound.x;
        trackedSound.y = sound.y;
        trackedSound.z = sound.z;
        trackedSound.index = sound.index;

        if(sound.id !== null) {
            trackedSound.calculateAngle();
        }
        web_feedback.send_sound_info(trackedSound.index, trackedSound.label, trackedSound.angle,
            trackedSound.probability, sound.id !== null);

    }
});

module.exports = {
    audioSection
};

