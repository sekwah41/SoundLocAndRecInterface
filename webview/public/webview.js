
let socket;

let reloadOnConnect = false;

window.onload = function() {
    socket = io.connect(window.location.href);

    socket.on('connect', () => {
        if(reloadOnConnect) {
            window.location.reload();
        }
        console.log("Connected");
    });

    socket.on('disconnect', () => {
        reloadOnConnect = true;
    });

    socket.on('reload', () => {
        window.location.reload();
    });

};
