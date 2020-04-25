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
    res.render('index', { title: 'Sound Rec & Loc Interface', max_sources: 4 })
});

module.exports = {};

module.exports.setup = (debug = false) => {
    server = app.listen((process.env.PORT || 8080), function() {
        let host = server.address().address;
        let port = server.address().port;

        console.log('Started device feedback overlay http://%s:%s', host, port);
    });

    io = require('socket.io')(server);

    io.on('connection', function(socket){
        console.log("Webclient connected");
        socket.emit("init", {data:"initinfo"});
    });

    let reload = () => {
        io.emit('reload', {reason:"TEST"});
    };

    //io.emit("progress", data);

    if(debug) {
        fs.watch(style_loc, (event, file) => {
            console.log(event);
            try {
                renderSCSS(style_loc);
            }
            catch(e) {
                console.error(e.stack);
            }
            reload();
        });

        fs.watch(path.join(__dirname, 'views', 'index.pug'), (event, file) => {
            console.log("pugggg");
            reload();
        });
    }
};
