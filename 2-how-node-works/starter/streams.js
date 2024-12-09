const fs = require('fs');
const server = require('http').createServer(); 

 server.on('request', (req, res) => {
    // Solution 1 -- bad
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) {
    //         console.log(err);
    //     }
    //     res.end(data);
    // });

    // -------------------------------------------------------------------
    // Solution 2: Streams
    // However this creates backpressure, we cannot send the data nearly as fast as we are reading it.
    // const readable = fs.createReadStream('test-file.txt');
    // readable.on('data', (chunk) => {
    //     // Writing, chunk by chunk;
    //     res.write(chunk);
    // });
    // // When all data has finished being read;
    // readable.on('end', () => {
    //     res.end(); 
    // });

    // readable.on('error', err => {
    //     console.log(err);
    //     res.statusCode = 500;
    //     res.end('File not found...');
    // });

    // -------------------------------------------------------------------
    // SOlution 3: PIPE
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);


 });

 server.listen(8000, "127.0.0.1", () => {
    console.log("Listening...");
 });

