const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

app.get('/file', (req, res) => {
    try {
		const relativePath = path.join(__dirname, 'mm', 'set.mm');
        const data = fs.readFileSync(relativePath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Error reading file');
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});