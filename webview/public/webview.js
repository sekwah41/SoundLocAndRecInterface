
let socket;

let reloadOnConnect = false;

let ringSize = 700;

let warning_sounds = ["fire_alarm"];

function setSoundData(sound) {
    let soundArm = document.querySelector(`#soundrot${sound.id}`)
    //console.log(sound);
    let soundInfo = soundArm.querySelector('.soundinfo');
    soundArm.style.transform = `translateX(50%) translateY(${ringSize/2}px) rotate(${sound.angle}deg) translateX(50%)`;
    soundInfo.style.transform = `rotate(${-sound.angle}deg)`
    soundArm.querySelector('.soundtype').textContent = sound.label;
    soundArm.querySelector('.soundpercent').textContent = Math.floor(sound.probability) + '%';
    console.log(sound.hidden);
    if(!sound.show) {
        if(!soundInfo.classList.contains("hidden")) {
            soundInfo.classList.add("hidden");
        }
    }
    else {
        if(soundInfo.classList.contains("hidden")) {
            soundInfo.classList.remove("hidden");
        }
    }
    if(warning_sounds.indexOf(sound.label) !== -1) {
        if(!soundInfo.classList.contains("warning")) {
            soundArm.classList.add("warning");
        }
    }
    else {
        if(soundInfo.classList.contains("warning")) {
            soundArm.classList.remove("warning");
        }
    }
}

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

    socket.on('sounds', (data) => {
        for(let sound of data) {
            setSoundData(sound);
        }
    });

    socket.on('reload', () => {
        window.location.reload();
    });

};
