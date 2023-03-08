var http = require('http');
var fs = require('fs');
var index = fs.readFileSync( 'index.html');

var SerialPort = require('serialport');
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\r\n'
});

var port = new SerialPort('COM3',{ 
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

port.pipe(parser);

var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

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
