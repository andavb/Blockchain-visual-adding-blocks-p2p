const express = require('express');
const bodyParser = require('body-parser');
const Vozlisce = require('./vozlisca');

const port = 200+Math.floor(Math.random()*30);//port kjer bo tekelo vozlisce random do 30
let vozlisce = new Vozlisce(port);
console.log('Vozlisce tece na '+ port + ' PORTU');
const http_port = 1000+Math.floor(Math.random()*10);//port kjer imamo spletni strežnik

vozlisce.ini();

let HTTP = function (){
	const app = new express();

	const sever = require('http').Server(app);
	const io = require('socket.io')(sever);

	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());

	app.listen(http_port, () => {
		console.log(`HTTP: ${http_port}`);
	})

	app.get('/', function (req, res) {
	  res.sendFile(__dirname + '/stran.html');
	});

	app.post('/test', function (req, res) {
		console.log('dodaj novega: '+req.body.data);
		vozlisce.addP2P('localhost', req.body.data);
		res.send(vozlisce.getVeriga());

	});

	app.post('/dodaj', function (req, res) {
		let newBlock = vozlisce.kreirajBlok(req.body.data);
		console.log('blok narjen');
		res.send(vozlisce.getVeriga());
	});

	app.post('/pridobi', function (req, res) {
		res.send(vozlisce.getVeriga());
	});

}

let httpserver = new HTTP();
