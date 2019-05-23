const Crypto = require('crypto');

const BlockChain = function() {

	let trenutniBlok = {};
	let prviBlok = {};
	let veriga = [];
	var diff = 4;
	var stevec = 0;

  /*setInterval(function(){
			diff = Math.floor(Math.random() * 4) + 1;
			console.log("Menjam diff: " + diff);
	},30*1000);*/
	function getTrenutniBlok(){
		return trenutniBlok;
	}

	function getVeriga(){
		return veriga;
	}

	function getStBlokov(){
		return veriga.length;
	}

	function zamenjajDiff(){
		diff = Math.floor(Math.random() * 4) + 1;
		console.log("Menjam diff: " + diff);
	}

	function inicializacija(){
		prviBlok = {
        index: 0
		  , data: "Nas prvi blok"
			, timestamp: 1547072351259
		  , previousHash: "0"
		  , nonce: 0
		};

		prviBlok.hash = createHash(prviBlok);

		veriga.push(prviBlok);
		trenutniBlok = prviBlok;
	}

	function createHash({ timestamp, data, index, previousHash, nonce }, diff) {
		return Crypto.createHash('SHA256').update(timestamp+data+index+previousHash+nonce+5).digest('hex');
	}

	function HashCreate({ timestamp, data, index, previousHash, nonce }, diff) {
		return Crypto.createHash('SHA256').update(timestamp+data+index+previousHash+nonce+5).digest('hex');
	}

	function getDiff(){
		var st = 1;
	  var res = "0";
	  while(st !== diff){
	  	res = res.concat("0");
	  	st++;
	  }
		return res;
	}

	function dodajVverigo(block){
		if(validirajBlok(block, trenutniBlok)){
			veriga.push(block);
			trenutniBlok = block;

			if(stevec == 3){
				zamenjajDiff();
				stevec = 0;
			}
			else {
				stevec++;
			}

			return true;
		}
		return false;
	}

	function kreirajBlok(podatki){
		let newBlock = {
		     timestamp: new Date().getTime()
			  , index: trenutniBlok.index+1
			  , data: podatki
			  , previousHash: trenutniBlok.hash
			  , nonce: 0
		};

		newBlock = proofOfWork(newBlock);

		return newBlock;
	}

	function proofOfWork(block){

		while(true){
			block.hash = HashCreate(block, diff);

			if(block.hash.slice(0, diff) === getDiff()){
				return block;
			}else{
				block.nonce++;
			}
		}
	}

	function zamenjajVerigo(nova){
		veriga = nova;
		trenutniBlok = veriga[veriga.length-1];
	}

	function validirajBlok(blok, prejsniBlok){
		if(prejsniBlok.index + 1 !== blok.index){
			return false;
		}
		else if (prejsniBlok.hash !== blok.previousHash){
			return false;
		}
		else if(!validirajHash(blok)){
			return false;
		}
		return true;
	}

	function validirajHash(blok){
		return (createHash(blok) == blok.hash);
	}

	function validirajNovoVerigo(nova){
		if(createHash(nova[0]) !== prviBlok.hash ){//prvi blok mora imeti isti hash v BlockChain
			return false;
		}

		let prejsnjiBlok = nova[0];
		let indexB = 1;

        while(indexB < nova.length){
        	let block = nova[indexB];

        	if(block.previousHash !== createHash(prejsnjiBlok)){
        		return false;
        	}

        	if(block.hash.slice(0, diff) !== getDiff()){
        		return false;
        	}

        	prejsnjiBlok = block;
        	indexB++;
        }

        return true;
	}

	return {
		inicializacija,
		kreirajBlok,
		dodajVverigo,
		validirajBlok,
		getTrenutniBlok,
		getStBlokov,
		getVeriga,
		validirajNovoVerigo,
		zamenjajVerigo
	};
};

module.exports = BlockChain;
