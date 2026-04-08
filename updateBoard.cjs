const ws281x = require('/home/aj/led-sub-count/node-rpi-ws281x-native');
const numbers = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],          // "0"
    [0, 1, 2, 3, 4],                                 // "1"
    [0, 1, 2, 12, 4, 5, 6, 7, 8, 10, 11],            // "2"
    [0, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12],            // "3"
    [2, 3, 4, 6, 7, 8, 9, 10, 11],                   // "4"
    [0, 11, 10, 9, 8, 12, 2, 3, 4, 5, 6],            // "5"
    [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12],         // "6"
    [4, 5, 6, 7, 8, 9, 10],                          // "7"
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],      // "8"
    [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]          // "9"
];

const LED_COUNT = 130;
const channel = ws281x(LED_COUNT, {
    gpioPin: 18,
    brightness: 255,
    stripType: ws281x.stripType.WS2812,
});

const pixels = channel.array;

function updateBoard(data) {
    resetBoard();
    let count = data['user']['count'];
    let color = data['settings']['color'];

    for (let i = 0; i < count.toString().length; i++) {
        let number = count.toString()[i];
        let numberArray = numbers[number];
        for (let j = 0; j < numberArray.length; j++) {
            pixels[i * 13 + numberArray[j]] = color;
        }
    }
    ws281x.render();
}

function resetBoard() {
    pixels.fill(0);
    ws281x.render();
}

process.on('SIGINT', () => {
    pixels.fill(0);
    ws281x.render();
    ws281x.reset();
    process.exit(0);
});

module.exports = updateBoard;