/*
xml2json v 1.1
copyright 2005-2007 Thomas Frank

This program is free software under the terms of the 
GNU General Public License version 2 as published by the Free 
Software Foundation. It is distributed without any warranty.
*/

var xmlobject;

function no_fast_endings(x){
	x=x.split("/>");
	for (var i=1;i<x.length;i++){
		var t=x[i-1].substring(x[i-1].lastIndexOf("<")+1).split(" ")[0];
		x[i]="></"+t+">"+x[i]
	}	;
	x=x.join("");
	return x
}

function attris_to_tags(x){
	var d=' ="\''.split("");
	x=x.split(">");
	for (var i=0;i<x.length;i++){
		var temp=x[i].split("<");
		for (var r=0;r<4;r++){temp[0]=temp[0].replace(new RegExp(d[r],"g"),"_jsonconvtemp"+r+"_")};
		if(temp[1]){
			temp[1]=temp[1].replace(/'/g,'"');
			temp[1]=temp[1].split('"');
			for (var j=1;j<temp[1].length;j+=2){
				for (var r=0;r<4;r++){temp[1][j]=temp[1][j].replace(new RegExp(d[r],"g"),"_jsonconvtemp"+r+"_")}
			};
			temp[1]=temp[1].join('"')
		};
		x[i]=temp.join("<")
	};
	x=x.join(">");
	x=x.replace(/ ([^=]*)=([^ |>]*)/g,"><$1>$2</$1");
	x=x.replace(/>"/g,">").replace(/"</g,"<");
	for (var r=0;r<4;r++){x=x.replace(new RegExp("_jsonconvtemp"+r+"_","g"),d[r])}	;
	return x
}

function parser(xmlcode,ignoretags,debug){
	if(typeof xmlcode === 'string'){
		xmlobject={};//otherwise the object will inherit previous value, in a CommonJS module context. (miyako)
		if(!ignoretags){ignoretags=""};
		xmlcode=xml_escape(xmlcode)
		xmlcode=xmlcode.replace(/\s*\/>/g,'/>');
		xmlcode=xmlcode.replace(/<\?[^>]*>/g,"").replace(/<\![^>]*>/g,"");
		if (!ignoretags.sort){ignoretags=ignoretags.split(",")};
		var x=no_fast_endings(xmlcode);
		x=attris_to_tags(x);
		x=escape(x);
		x=x.split("%3C").join("<").split("%3E").join(">").split("%3D").join("=").split("%22").join("\"");
		for (var i=0;i<ignoretags.length;i++){
			x=x.replace(new RegExp("<"+ignoretags[i]+">","g"),"*$**"+ignoretags[i]+"**$*");
			x=x.replace(new RegExp("</"+ignoretags[i]+">","g"),"*$***"+ignoretags[i]+"**$*")
		};
		x='<JSONTAGWRAPPER>'+x+'</JSONTAGWRAPPER>';
		var y=xml_to_object(x).jsontagwrapper;
		if(debug){y=show_json_structure(y,debug)};
		return y
	}
}

function xml_escape(str){
	if(typeof str === 'string'){
		return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, function(a, b){
			return b.replace(/&/g,'\uFFF9').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&apos;').replace(/"/g,'&quot;').replace(/\uFFF9/g,'&amp;')
		});	
	}
}

function xml_unescape(str){
	return str.replace(/%26lt%3B/g, '%3C').replace(/%26gt%3B/g, '%3E').replace(/%26apos%3B/g, '%27').replace(/%26quot%3B/g, '%22').replace(/%26amp%3B/g, '%26');
}

function xml_to_object(xmlcode){
	var x=xmlcode.replace(/<\//g,"ß");	
//	x=x.split(/</);
	x=x.split(/(?:%0A|%0D|%09|%20)*<(?:%0A|%0D|%09|%20)*/m);
	var y=[];
	var level=0;
	var opentags=[];
	for (var i=1;i<x.length;i++){
//		var tagname=x[i].split(/>/)[0];
		var tagname=x[i].split(/(?:%0A|%0D|%09|%20)*>(?:%0A|%0D|%09|%20)*/m)[0];
		opentags.push(tagname);
		level++
		var sx = x[i].split("ß");
		y.push(level+"<"+sx[0]);
		
		if(sx.length > 1){
			if(sx[1].indexOf(tagname + ">") === 0){
				var elementvalue = sx[1].substring((tagname + ">").length);
				if(elementvalue.length !==0){
					y.push(level+"<__value__>"+elementvalue);
				}
			}
		}			
		while(x[i].indexOf("ß"+opentags[opentags.length-1]+">")>=0){level--;opentags.pop()}
	};
	var oldniva=-1;
	var objname="xmlobject";
	for (var i=0;i<y.length;i++){
		var preeval="";
		var niva=y[i].split("<")[0];
		var tagnamn=y[i].split("<")[1].split(">")[0];
		tagnamn=tagnamn.toLowerCase();
		var rest=y[i].split(">")[1];
		if(niva<=oldniva){
			var tabort=oldniva-niva+1;
			for (var j=0;j<tabort;j++){
				var m=objname.match(/(.+)\[\".+?\"\]/);
				objname = m ? m[1] : '';
				}
		};
		tagnamn=tagnamn.replace(/-/g, '').replace(/%0a|%0d|%09|%20/g, '');//colon for namespaces
		tagnamn=tagnamn.replace(/-/g, '').replace(/%3a/g, ':');
		tagnamn=tagnamn.replace(/-/g, '').replace(/%3a|%0a|%0d|%09|%20/g, '');
		objname+='[\"'+tagnamn+'"]';
		var m=objname.match(/(.+)\[\".+?\"\]/);
		var pobject = m ? m[1] : '';
				
		if (eval("typeof "+pobject) != "object"){preeval+=pobject+"={value:"+pobject+"};\n"};
		var objlast=objname.substring(objname.lastIndexOf(".")+1);
		
		var already=false;
		for (k in eval(pobject)){if(k==objlast){already=true}};
		var onlywhites=true;
		for(var s=0;s<rest.length;s+=3){
			if(rest.charAt(s)!="%"){onlywhites=false}
		};
		if (rest!="" && !onlywhites){
			if(rest/1!=rest){
				rest="'"+xml_unescape(rest).replace(/\'/g,"\\'")+"'";
				rest=rest.replace(/\*\$\*\*\*/g,"</");
				rest=rest.replace(/\*\$\*\*/g,"<");
				rest=rest.replace(/\*\*\$\*/g,">")
			}
		} 
		else {rest="{}"};
		if(rest.charAt(0)=="'"){rest='unescape('+rest+')'};
		if (already && !eval(objname+".sort")){preeval+=objname+"=["+objname+"];\n"};
		var before="=";after="";
		if (already){before=".push(";after=")"};
		var toeval=preeval+objname+before+rest+after;
		eval(toeval);
		if(eval(objname+".sort")){objname+="["+eval(objname+".length-1")+"]"};
		oldniva=niva
	};
	return xmlobject
}
	
function show_json_structure(obj,debug,l){
	var x='';
	if (obj.sort){x+="[\n"} else {x+="{\n"};
	for (var i in obj){
		if (!obj.sort){x+=i+":"};
		if (typeof obj[i] == "object"){
			x+=show_json_structure(obj[i],false,1)
		}
		else {
			if(typeof obj[i]=="function"){
				var v=obj[i]+"";
				//v=v.replace(/\t/g,"");
				x+=v
			}
			else if(typeof obj[i]!="string"){x+=obj[i]+",\n"}
			else {x+="'"+obj[i].replace(/\'/g,"\\'").replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/\r/g,"\\r")+	"',\n"}
		}
	};
	if (obj.sort){x+="],\n"} else {x+="},\n"};
	if (!l){
		x=x.substring(0,x.lastIndexOf(","));
		x=x.replace(new RegExp(",\n}","g"),"\n}");
		x=x.replace(new RegExp(",\n]","g"),"\n]");
		var y=x.split("\n");x="";
		var lvl=0;
		for (var i=0;i<y.length;i++){
			if(y[i].indexOf("}")>=0 || y[i].indexOf("]")>=0){lvl--};
			tabs="";for(var j=0;j<lvl;j++){tabs+="\t"};
			x+=tabs+y[i]+"\n";
			if(y[i].indexOf("{")>=0 || y[i].indexOf("[")>=0){lvl++}
		};
		if(debug=="html"){
			x=x.replace(/</g,"&lt;").replace(/>/g,"&gt;");
			x=x.replace(/\n/g,"<BR>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;")
		};
		if (debug=="compact"){x=x.replace(/\n/g,"").replace(/\t/g,"")}
	};
	return x
}

if(!Array.prototype.push){
	Array.prototype.push=function(x){
		this[this.length]=x;
		return true
	}
};

if (!Array.prototype.pop){
	Array.prototype.pop=function(){
  		var response = this[this.length-1];
  		this.length--;
  		return response
	}
};

exports.parse = parser;
