const express = require('express');

let app = express();


let server = app.listen((process.env.PORT || 8080), function() {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Started sekkie stream overlay http://%s:%s', host, port);
    console.log('Open https://www.sekwah.com/spotify to get a token');
});

app.use(express.static(path.join(__dirname, "public")));
