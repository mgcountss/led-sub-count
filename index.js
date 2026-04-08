import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import fs from 'fs';
import updateBoard from './updateBoard.js';

let autoUpdateInterval = null;
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//send any file in the public directory
app.get('/:file', (req, res) => {
    res.sendFile(__dirname + '/public/' + req.params.file);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/settings', (req, res) => {
    res.json(data['settings']);
});

app.get('/api/user', (req, res) => {
    res.json(data['user']);
});

app.post('/api/search', (req, res) => {
    fetch('https://mixerno.space/api/youtube-channel-counter/search/' + req.body.search)
        .then(res => res.json())
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(500).send('Error searching for channel');
        });
});

app.post('/api/save', (req, res) => {
    data['settings'] = req.body;
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    if (data['settings']['autoUpdate'] == true) {
        manageAutoUpdate();
    }
    res.json({ message: 'Data saved successfully' });
});

function manageAutoUpdate() {
    if (data['settings']['autoUpdate'] == false) {
        if (autoUpdateInterval) {
            clearInterval(autoUpdateInterval);
        }
        return;
    }

    autoUpdateInterval = setInterval(() => {
        fetch('https://mixerno.space/api/youtube-channel-counter/user/' + data['settings']['id'])
            .then(res => res.json())
            .then(data => {
                data['user'] = data;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
                updateBoard(data);
            });
    }, parseInt(data['settings']['interval']) * 1000);
}

updateBoard({
    'settings': {
        'color': '#ff0000'
    },
    'user': {
        'count': 1234567890
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000')
});