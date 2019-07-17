var fs = require("fs");
var textdb = new Object();
var filename = ""
var ftext = ""
var readline = require('readline');
var log = console.log;
var inputs = []
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//read input
var recursiveInputLoop = function () {
  rl.question('', function (answer) {
  	inputs = answer.split(" ")
    if (answer == 'exit') 
      return rl.close(); 
  	else if (answer.split(" ")[0] == "upload"){
  		filename = inputs[1]
  		ftext = get_tokens(filename)
  		console.log(filename)
  		textdb[filename] = 
  			{text: ftext,
  			 dict: get_trigrams[ftext]}
  		textdb[filename].dict = get_trigrams(textdb[filename].text)
  	}
  	else if (answer == "files"){
  		for(var name in textdb){
  			console.log(name)
  		}
  	}
  	else if (inputs[0] == "file" && inputs[1] == "id="){
  		get_file_info(inputs[2])
  	}
  	else if (inputs[0] == "generate"){
  		generate_file(inputs[2],parseInt(inputs[4]),inputs[6],inputs[7])
  	}
  	else{
  		console.log("See readme for usage")
  	}
    recursiveInputLoop(); 
  });
};
recursiveInputLoop();


//get all words/punctuation as individual tokens
function get_tokens(filename){
	filepath = "./" + filename
	var text = fs.readFileSync(filepath).toString('utf-8');
	var tokens = text.split(/[\-"\n\r\s]+/);
	var tlist = [];
	var k = 0;
	for(var i = 0; i < tokens.length; i++){
		if(/[~`!#$%\^&*+=\-\[\]\\';,./{}|\\":<>\?]/g.test(tokens[i][tokens[i].length-1])){
			if(tokens[i].length > 1){
				tlist[k] = tokens[i].substring(0,tokens[i].length-1);
				tlist[k+1] = tokens[i].substring(tokens[i].length-1);
				k++
			}
			else{
				tlist[k] = tokens[i];
			}
		}
		else{
			tlist[k] = tokens[i];
		}
		k++
	}
	return(tlist);
}

//create dictionary out of all trigrams
function get_trigrams(tlist){
	var trigrams = new Map();
	var tuptest = ["",""];
	for(var j = 0; j < tlist.length-2; j++){
		tuptest[0] = tlist[j];
		tuptest[1] = tlist[j+1];
		if(trigrams[tuptest]){
			trigrams[tuptest].add(tlist[j+2]);
		}
		else{
			trigrams[tuptest] = new Set([]);
			trigrams[tuptest].add(tlist[j+2]);
		}
	}
	return(trigrams);
}

//print filesize and number of trigrams
function get_file_info(filename){
	var filesize = fs.statSync(filename).size
	console.log("Filesize: " + filesize + " bytes")
	tg = textdb[filename].dict
	var tcount = 0;
	for(var key in tg){
		tcount = tcount + tg[key].size
	}
	console.log("Number of trigrams: " + tcount)
}

//prints generated file to stdout
function generate_file(filename, size, seed1, seed2){
	var text = []
	var t2 = ""
	var tg = textdb[filename].dict
	text[0] = seed1
	text[1] = seed2
	var tup = [text[0],text[1]]
	var sSize = 0
	for(var l = 2; l < size; l++){
		if(tg[tup]){
			sSize = tg[tup].size
			text[l] = [...tg[tup]][l%sSize]
			tup = [text[l-1],[text[l]]]
		}
		else{
			if(text[l-1] == "."){
				text[l] = seed1
				tup = [text[l-1],[text[l]]]
			}
			else{
				text[l] = "."
				tup = [seed1,seed2]	
			}
		}
	}
	for(var n = 0; n < text.length; n++){
		t2 = t2 + text[n] + " ";
	}
	console.log(t2)
}
