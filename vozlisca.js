const BlockChain = require('./Blockchain');
const WebSocket = require('ws');

const Vozlisce = function(port){
    let bServer;
    let blockchainSockets = [];
    let portt2 = port
    let veriga = new BlockChain();

    const zahtevaZaVerigo = "REQUEST_CHAIN";
    const zahtevaZaBlok = "REQUEST_BLOCK";
    const blok = "BLOCK";
	const verigaR = "CHAIN";

    function ini(){

        veriga.inicializacija();

        bServer = new WebSocket.Server({ port: portt2 });

        bServer.on('connection', (connection) => {
            console.log('connection in');
            inicializirajPovezavo(connection);
        });
    }

    const addP2P = (host, port) => {
        let connection = new WebSocket(`ws://${host}:${port}`);

        console.log(port +" " + host);
        connection.on('napaka', (error) =>{
            console.log(error);
        });

        connection.on('open', (msg) =>{
            inicializirajPovezavo(connection);
        });
    }

    const sporocila = (connection) =>{
        connection.on('message', (data) => {
            const msg = JSON.parse(data);
            //console.log(msg.event);
            //console.log(msg.message);
            switch(msg.event){
            	case zahtevaZaVerigo:
                    connection.send(JSON.stringify({ event: verigaR, message: veriga.getVeriga()}))
                    break;
            	case zahtevaZaBlok:
                    zahtevajZadnjiBlok(connection);
                    break;
                case blok:
                    procesirajDobljeniBlok(msg.message);
                    break;
                case verigaR:
                    procesirajDobljenoVerigo(msg.message);
                    break;

                default:
                    console.log('Unknown message ');
            }
        });
    }


    const procesirajDobljenoVerigo = (blocks) => {
        let novaVeriga = blocks.sort((block1, block2) => (block1.index - block2.index))

        if(novaVeriga.length > veriga.getStBlokov() && veriga.validirajNovoVerigo(novaVeriga)){
        	veriga.zamenjajVerigo(novaVeriga);
        	console.log('veriga replaced');
        }
    }

    const procesirajDobljeniBlok = (blok) => {

        let trenutniBlok = veriga.getTrenutniBlok();

        // ali je ta ali je prejnsi
        if(blok.index <= trenutniBlok.index){
        	console.log('Ni potrebe os ezitve');
        	return;
        }

        if(blok.previousHash == trenutniBlok.hash){
        	//damo v verigo
        	veriga.dodajVverigo(blok);

        	console.log('Nov blok dodan');
        	console.log(veriga.getTrenutniBlok());
        }else{

        	broadcastSpo(zahtevaZaVerigo,"");
        }
    }

    const zahtevajZadnjiBlok = (connection) => {
        connection.send(JSON.stringify({ event: blok, message: veriga.getTrenutniBlok()}))
    }

    const broadcastSpo = (event, message) => {
        blockchainSockets.forEach(node => node.send(JSON.stringify({ event, message})))
    }

    const zapriPovezavo = (connection) => {
        console.log('zapiram povezavo');
        blockchainSockets.splice(blockchainSockets.indexOf(connection),1);
    }

    const inicializirajPovezavo = (connection) => {
      console.log('povezujem');

        sporocila(connection);

        zahtevajZadnjiBlok(connection);

        blockchainSockets.push(connection);

        connection.on('error', () => zapriPovezavo(connection));
        connection.on('close', () => zapriPovezavo(connection));
    }

    const kreirajBlok = (podatki) => {
        let novBlok = veriga.kreirajBlok(podatki)
        veriga.dodajVverigo(novBlok);

    		broadcastSpo(blok, novBlok);
    }

    const getStBlok = () => {
        return {
            bloki: veriga.getStBlokov()
        }
    }

    const getVeriga = () => {
        return {
            bloki: veriga.getVeriga()
        }
    }

    return {
        ini,
        broadcastSpo,
        addP2P,
        kreirajBlok,
        getStBlok,
        getVeriga
    }

}

module.exports = Vozlisce;
