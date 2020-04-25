const web_feedback = require('./webview/simplefeedback_display');

web_feedback.setup(true);

setInterval(() => {
    web_feedback.send_sound_info(0, "fire_alarm", Math.random() * 360 - 180,
        Math.random() * 100, true);
    web_feedback.send_sound_info(1, "drilling", Math.random() * 360 - 180,
        Math.random() * 100, Math.random() > 0.5);
    web_feedback.send_sound_info(2, "street_music", Math.random() * 360 - 180,
        Math.random() * 100, true);
    web_feedback.send_sound_info(3, "dog_barking", Math.random() * 360 - 180,
        Math.random() * 100, true);
}, 2000);
