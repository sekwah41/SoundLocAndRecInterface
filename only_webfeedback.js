const web_feedback = require('./webview/simplefeedback_display');

web_feedback.setup(true);

web_feedback.send_sound_info(0, "fire_alarm", 45, 50);
web_feedback.send_sound_info(1, "drilling", 120, 50);
web_feedback.send_sound_info(2, "street_music", -40, 50);
web_feedback.send_sound_info(4, "dog_barking", 180, 50);
