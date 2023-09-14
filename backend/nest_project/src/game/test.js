// const WebSocket = require('ws');
// const server = new WebSocket.server({ port: 3003 });

// server.on('connection', ws => {
// 	ws.send('[server connection success!]');

// 	ws.on('close', () => {
// 		console.log('client connection over');
// 	});
// });


let testObject;

function clickMouse()
{
	console.log("click it!");
}

testObject.addEventListener("click", clickMouse);