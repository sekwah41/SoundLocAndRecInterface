const streamToText = require('./stream-to-text.js');
const path = require('path');
const wav = require('wav');
const EventEmitter = require('events');
const appSettings = require('./settings.js').appSettings;

/*
 * Audio parameters
 */

const bitNumber = 16;

const clipSize = 16000/* * 1*/;

/*
    End of parameters
*/

// Audio Recorder
exports.AudioRecorder =  class AudioRecorder extends EventEmitter {

    constructor(index, suffix) {
        super();

        this.active = false;
        this.hold = false;
        this.index = index;

        this.recordingEnabled = false;
        this.workspacePath = '';
        this.suffix = suffix;

        this.samplesWritten = 0;

        this.buffer = undefined;
        this.writer = undefined;
        this.path = undefined;

        this.split_output = suffix === 'pf';
        this.current_id = -1;
        this.timestamp = "";
        this.split_count = 0;
    }

    receive(data) {

        if(this.active) {

            if(this.split_output && this.samplesWritten++ % clipSize === clipSize - 1) {
                this.splitNewFile();

            }

            if(this.hold) {

                if(typeof(this.buffer) !== 'undefined') {

                    this.buffer = Buffer.concat([this.buffer, data]);
                }

                else {

                    this.buffer = data;
                }
            }

            else {

                try {

                    if(typeof(this.buffer) !== 'undefined') {

                        data = Buffer.concat([this.buffer, data]);
                        this.buffer = undefined;

                        console.log(`Wrote samples buffered in writer ${this.index}`);
                    }

                    if( !this.writer.write(data)) {

                        console.warn(`Write stream ${this.index} is full\nHolding samples...`);
                        this.hold = true;
                    }
                }

                catch(err) {
                    console.log("Thar be errors", this.writer, this.current_id);
                    console.error(`Couldn't write to recorder ${this.index}`);
                    console.warn(err);

                    this.stopRecording();
                }

            }

        }
    }

    splitNewFile() {
        if(this.recordingEnabled && this.active) {

            console.log(`Recorder ${this.index} split`);

            this.writer.end();

            let tempWriter = this.writer;

            tempWriter.on('header',(header) => {

                console.log(`Registered header on recorder ${this.index}`);
                this.emit('add-recording', tempWriter.path);
                console.log(`Recorder ${this.index} undefined`);

                this.emit('audio-analyse', {id:this.current_id, path: tempWriter.path});

            });

            // Start again

            console.log(`Recorder ${this.index} split file`);

            let filename = path.join(this.workspacePath, `ODAS_${this.current_id}_${this.timestamp}_${++this.split_count}_${this.suffix}.wav`);
            this.path = filename;

            try {
                this.writer = new wav.FileWriter(filename,{channels:1, sampleRate:appSettings.sampleRate, bitDepth:bitNumber});
                // this.emit('fuzzy-recording', filename);

                this.writer.on('drain', () => { // Release hold when write stream is cleared
                    console.log(`Writer ${this.index} is empty.\nResuming...`);
                    this.hold = false;
                });

                this.active = true;
                this.hold = false;
                console.log("new writer created", this.current_id);
                // this.buffer = undefined;
            }

            catch(err) {
                console.error(`Failed to start recorder ${this.index}`);
                console.log(err);
                this.writer = undefined;
            }
        }
    }

    startRecording(id) {
        if(this.recordingEnabled) {
            this.current_id = id;
            this.split_count = 0;
            if(typeof(this.writer) !== 'undefined') {	// Verify that previous recording is cleared

                setTimeout(() => {
                    console.log(`Recorder not defined, retrying`);
                    this.startRecording(id);
                    console.log(`Recorder ${id} was defined. Retrying...`);
                }, 100);

                return;
            }

            console.log(`Recorder ${this.index} started`);
            console.log(`Recorder ${this.index} was ${this.active} active`);

            let now = new Date();

            let dateString = "";
            dateString += now.getFullYear() + "-";
            dateString += (now.getMonth()+1) + "-";
            dateString += now.getDate();

            let timeString = "";
            timeString += now.getHours() + "-";
            timeString += now.getMinutes() + "-";
            timeString += now.getSeconds() + "-";
            timeString += now.getMilliseconds();

            let datetimeString = dateString + "_" + timeString;

            this.timestamp = datetimeString;

            let filename = path.join(this.workspacePath, `ODAS_${id}_${this.timestamp}_${this.suffix}.wav`);
            this.path = filename;

            try {
                this.writer = new wav.FileWriter(filename,{channels:1, sampleRate:appSettings.sampleRate, bitDepth:bitNumber});
                this.emit('fuzzy-recording', filename);

                this.writer.on('drain', () => { // Release hold when write stream is cleared
                    console.log(`Writer ${this.index} is empty.\nResuming...`);
                    this.hold = false;
                });

                this.active = true;
                this.hold = false;
                this.buffer = undefined;
            }

            catch(err) {
                console.error(`Failed to start recorder ${this.index}`);
                console.log(err);
                this.writer = undefined;
            }
        }
    }

    stopRecording() {

        if(this.active) {

            this.active = false;
            console.log(`Recorder ${this.index} ended`);

            console.log(`Registering header on recorder ${this.index}`);
            this.writer.end();

            this.writer.on('header',(header) => {

                console.log(`Registered header on recorder ${this.index}`);
                this.emit('add-recording', this.writer.path);

                this.writer = undefined;
                console.log(`Recorder ${this.index} undefined`);

            });
        }
    }

    enableRecording(workspacePath) {
        this.recordingEnabled = true;
        this.workspacePath = workspacePath;
    }

    disableRecording() {
        this.recordingEnabled = false;
        this.stopRecording();
    }
};
