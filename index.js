import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import updateBoard from './updateBoard.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

let autoUpdateInterval = null;
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
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

function convertColor(color) {
    return parseInt(color.replace('#', '0x'), 16);
}

function subscriberCountFromMixerno(payload) {
    if (!payload || typeof payload !== 'object') return null;
    if (typeof payload.count === 'number') return payload.count;
    if (Array.isArray(payload.counts)) {
        const row = payload.counts.find((c) => c.value === 'subscribers');
        if (row && row.count != null) return Number(row.count);
    }
    return null;
}

app.post('/api/save', (req, res) => {
    data['settings'] = { ...req.body };
    if (typeof data['settings']['color'] === 'string' && data['settings']['color'].startsWith('#')) {
        data['settings']['color'] = convertColor(data['settings']['color']);
    }
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
            autoUpdateInterval = null;
        }
        return;
    }

    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }

    autoUpdateInterval = setInterval(() => {
        fetch('https://mixerno.space/api/youtube-channel-counter/user/' + data['settings']['id'])
            .then(res => res.json())
            .then((userPayload) => {
                const n = subscriberCountFromMixerno(userPayload);
                data.user = n != null ? { ...userPayload, count: n } : userPayload;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
                updateBoard(data);
            });
    }, parseInt(data['settings']['interval']) * 1000);
}

// Static files from public (must be after /api routes so /api/* is not captured as a filename)
app.get('/:file', (req, res) => {
    res.sendFile(join(__dirname, 'public', req.params.file));
});

app.listen(4000, () => {
    console.log('Server is running on port 4000')
});