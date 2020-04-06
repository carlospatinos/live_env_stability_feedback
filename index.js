const YeeDiscovery = require('yeelight-platform').Discovery
const YeeDevice = require('yeelight-platform').Device
const discoveryService = new YeeDiscovery()

const MAX_NUM_COLOUR_CHANGE = 5;
const TIME_BETWEEN_COLOUR_CHANGE = 1500;
const WHITE_COLOUR = 16777215;
const RED_COLOUR = 16711680;
const YELLOW_COLOUR = 16776960;
const player = require('play-sound')();

async function alarmSound() {
    player.play(`${__dirname}/sound/fire_department_dispatch_pager.mp3`, (err) => {
        if (err) console.log(`Could not play sound: ${err}`);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

discoveryService.on('started', () => {
    console.log('** Discovery Started **')
    alarmSound();
});

discoveryService.on('didDiscoverDevice', (deviceInfo) => {
    console.log('** found it **' + deviceInfo.host + ":" + deviceInfo.port);

    const device = new YeeDevice({host: deviceInfo.host, port: deviceInfo.port});

    device.connect()

    device.on('deviceUpdate', (newProps) => {
        console.log(newProps)
    })
    
    device.on('connected', () => {
        alarmFunction(device);
    });
});

const alarmFunction = async (dev) => {
    
    dev.sendCommand({
        id: -1,
        method: 'set_power',
        params: ["on", 'smooth', 100]
    });
    
    await sleep(1000);

    const colours = [RED_COLOUR, YELLOW_COLOUR];
    let index = 0;
    while (index < MAX_NUM_COLOUR_CHANGE) {
        dev.sendCommand({
            id: -1,
            method: 'set_rgb',
            params: [colours[index%2], "sudden", 500]
        });
        await sleep(TIME_BETWEEN_COLOUR_CHANGE);
        index++;
    };

    dev.sendCommand({
        id: -1,
        method: 'set_rgb',
        params: [WHITE_COLOUR, "sudden", 500]
    });

}

// TODO Trigger this when some failure happens on prod enviroment UATs.
discoveryService.listen();