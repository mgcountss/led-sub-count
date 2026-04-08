import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import fs from 'fs';

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
    res.json({ message: 'Data saved successfully' });
});

app.listen(4000, () => {
    console.log('Server is running on port 4000')
});