const express = require('express');
const autoprefixer = require('autoprefixer-core');
const sass = require('sass');
const path = require('path');
const fs = require('fs');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, "../node_modules/socket.io-client/dist")));
app.use(express.static(path.join(__dirname, "public")));

let server;

let io;

let max_sources = 4;

function renderSCSS(file, data = null) {
    let result = sass.renderSync({
        file: file,
        data: data,
        outputStyle: "compressed",
        sourceMapEmbed: true
    });
    fs.writeFile(file.substr(0, file.length-5) + ".css", result.css, function(err){
        if(err){
            console.error("There was a problem writing the styles");
        }
    });
    return autoprefixer.process(result.css).css;
}

let style_loc = path.join(__dirname, 'public', 'style.scss');
try {
    renderSCSS(style_loc);
}
catch(e) {
    console.error(e.stack);
}

app.get('/', function (req, res) {
    res.render('index', { title: 'Sound Rec & Loc Interface', max_sources: max_sources })
});
/*
app.post('/predict', function (req, res) {
    console.log(req);
    res.render('index', { title: 'Sound Rec & Loc Interface', max_sources: max_sources })
});*/

let soundData = [];

for(let i = 0; i < max_sources; i++) {
    soundData.push({id:0,
        label:"not_set",
        probability: 0,
        angle: 0,
        show: false});
}


module.exports = {};

module.exports.send_sound_info = (id, sound_label, angle, probability, show) => {
    let sound = soundData[id];
    sound.id = id;
    sound.label = sound_label;
    sound.angle = angle;
    sound.probability = probability;
    sound.show = show;
};

module.exports.setup = (debug = false) => {
    server = app.listen((process.env.PORT || 8070), function() {
        let host = server.address().address;
        let port = server.address().port;

        console.log('Started device feedback overlay http://%s:%s', host, port);
    });

    io = require('socket.io')(server);

    io.on('connection', function(socket){
        console.log("Webclient connected");
        socket.emit("init", {data:"initinfo"});
    });

    setInterval(() => {
        io.emit("sounds", soundData);
    }, 1000);

    //io.emit("progress", data);

    if(debug) {
        let reload = () => {
            io.emit('reload', {reason:"TEST"});
        };

        let renderTimeout;

        fs.watch(style_loc, (event, file) => {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(() => {
                console.log("Re-Render")
                try {
                    renderSCSS(style_loc);
                }
                catch(e) {
                    console.error(e.stack);
                }
                reload();
            }, 50);
        });

        fs.watch(path.join(__dirname, 'public', 'webview.js'), (event, file) => {
            reload();
        });

        fs.watch(path.join(__dirname, 'views', 'index.pug'), (event, file) => {
            reload();
        });
    }
};
