var http = require('http');
var fs = require('fs');
var path = require('path');
var index = fs.readFileSync( 'index.html');
var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

let serialPortPath = 'COM3'


var app = http.createServer(function(req, res) {
    const { url } = req;
    
    if (url === '/') {
        const indexPath = path.join(__dirname, 'index.html');
        const indexStream = fs.createReadStream(indexPath);
        res.writeHead(200, {'Content-Type': 'text/html'});
        indexStream.pipe(res);
    } else if(url.startsWith("/selector")){
      let arr = url.split("=")
      serialPortPath = arr[1]
      const indexPath = path.join(__dirname, 'index.html');
      const indexStream = fs.createReadStream(indexPath);
      res.writeHead(200, {'Content-Type': 'text/html'});
      indexStream.pipe(res);
    }
    else if (url === '/image.jfif') {
        const imagePath = path.join(__dirname, 'public', 'image.jfif');
        const imageStream = fs.createReadStream(imagePath);
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        imageStream.pipe(res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
});

var port = new SerialPort(serialPortPath,{ 
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

port.pipe(parser);

var io = require('socket.io').listen(app);
// let i = 0;
// let arr = [
//     { pos1: 0, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },
//     { pos1: 100, pos2: -100, freq1: 100, freq2: 200, delayTime: 50 },
//     { pos1: -100, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },
//     { pos1: 0, pos2: 100, freq1: 100, freq2: 200, delayTime: 50 },]
io.on('connection', function(socket) {
    
    console.log('Node is listening to port');
    // setInterval(() => {
    //     io.emit('data', arr[i%4]);
    //     i ++
    // }, 10);
    

});

let preprocess  = (data)  =>{
    let newData 
    try{
      let arr = data.split(" ")
      newData = {pos1: Number(arr[1].split("\x00")[0]) , pos2:Number(arr[2].split("\x00")[0]), freq1:Number(arr[3].split("\x00")[0]), freq2:Number(arr[4].split("\x00")[0]),  delayTime : Number(arr[5].split("\x00")[0])}
    }
    catch(err){
      newData = {
        pos1 : 0,
        pos2 : 0,
        freq1 : 0,
        freq2 : 0,
        delayTime : 0
      }
    }
    
    return newData
  }

parser.on('data', function(data) {
    
    console.log(data);
    
    
    io.emit('data', preprocess(data));
    
});

app.listen(4000,()=>{

    console.log("server is running.......");
});
