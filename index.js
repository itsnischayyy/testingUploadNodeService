const http = require('http');
const fs = require('fs'); // Correct way to import fs
const path = require('path');
const url = require('url');
const formidable = require('formidable'); // Use formidable to handle file uploads

// Create a folder to store the uploaded images
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url.startsWith('/upload')) {
        // Parse the URL to get query parameters
        const queryObject = url.parse(req.url, true).query;
        const { filename, timestamp, sign } = queryObject;

        console.log('--- Incoming Query Parameters ---');
        console.log('Filename:', filename);
        console.log('Timestamp:', timestamp);
        console.log('Sign:', sign);

        // Handle the file upload using formidable
        const form = new formidable.IncomingForm({ uploadDir: uploadFolder, keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error parsing the form:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ code: 400, message: 'File upload failed' }));
            }

            console.log('--- Uploaded Files ---');
            Object.keys(files).forEach((fileKey) => {
                const file = files[fileKey];
                if (file && file.path) {
                    console.log(`File uploaded: ${file.name}`);
                    console.log(`Stored as: ${file.path}`);

                    // Optionally, rename the file to match the `filename` parameter
                    if (filename) {
                        const newFilePath = path.join(uploadFolder, filename);
                        try {
                            fs.renameSync(file.path, newFilePath);
                            console.log(`File renamed to: ${newFilePath}`);
                        } catch (renameErr) {
                            console.error('Error renaming the file:', renameErr);
                        }
                    }
                } else {
                    console.log('No valid file uploaded.');
                }
            });

            // Send success response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                message: 'File upload success',
                data: filename || 'No filename provided'
            }));
        });
    } else {
        // For other routes or methods, send a 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start the server
server.listen(1133, () => {
    console.log('Server running on port 1133');
});

