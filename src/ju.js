function StringBuffer() {
var r = [];

function p(v) {
	if(v) r.push(v);
}

function pp(v, len, ch) {
	if(!ch) ch = '0';
	v = (v ? v.toString() : "");
	if(v.length < len) {
		for(var i = v.length; i < len; ++i) p(ch);
	}
	p(v);
}

function p1(v, l, s) {
	pp(v, l);
	p(s);
}

return {
	toString : function() {
		return r.join('');
	},
	push : p,
	pushPadded : pp,
	pushTimestamp : function() {
		var d = new Date();
		p1(d.getDate(), 2, '.');
		p1(d.getMonth() + 1, 2, '.');
		p1(d.getFullYear(), 4, ' ');
		p1(d.getHours(), 2, ':');
		p1(d.getMinutes(), 2, ':');
		p1(d.getSeconds(), 2, ':');
		p1(d.getMilliseconds(), 3);
	}
};
};

function getTimestamp() {
	var b = StringBuffer();
	b.pushTimestamp();
	return b.toString();
}

function empty(s) {
	return (!s || s.length == 0);
}

function fixRN(s) {
	return s ? s.replace( /\r?\n/g, "\n" ) : s;
}

function createXmlHttp(handler) {
	var x = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	x.onreadystatechange = function() {
		if(x.readyState == 4) {
			handler(x.responseText, x.status);
		}
	}
	return x;
}

function http(u, b, f) {
	if(empty(u) || !f) return false;
	b = fixRN(b);
	var q = createXmlHttp(function(t, s) {
		if(s == 200) {
			f(t, s);
		} else {
			f("" + s + ": " + t, s);
		}
	});
	q.open(b != null ? "POST" : "GET", u, true);
	try {
		q.send(b);
	} catch(e) {
		f(e, -1);
	}
}

function upload(n, b, f) {
	if(empty(n) || empty(b) || !f) return false;
	b = fixRN(b);
	var c = 512, p = 0, l = b.length;
	function w() {
		var q = "/fSave?name=" + uri(n) + "&pos=" + p;
		var d = p + c;
		if(d >= l) {
			q += "&flush=1";
			d = l;
		}
		return http(q, b.substring(p, d), function(re, s) {
			if(s == 200) {
				p = d;
				p < l ? w() : f(true);
			} else {
				confirm("Error when uploading " + n + ": " + re + ". Try again?") ? w() : f(false);
			}
		});
	};
	w();
}

dc = document;
function hT(v,t,a) {return "<"+ t + (a ? " " + a : "") + (v ? ">" + v + "</" + t + ">" : "/>");}
function hO(v) {return hT(v, "option") + "\n";}
function hArg(n,v) {return ((v != null) ? ' ' + n + '="' + v + '"' : '');}
function hB(v) {return hT(v, "b");}
function hTd(v, a) {return hT(v, "td", a);}
function hTr(v, a) {return hT(v, "tr", a) + "\n";}
function hInput(t,i,n,v,a){return hT(null, 'input', hArg('type', t) + hArg('id', i) + hArg('name', n) + hArg('value', v) + (a?" " + a:""));}
function hRadio(l,v,i,n,s,c) {return hInput('radio', i, n, v, hArg('onclick', c) + hArg('checked', (s?"checked":null))) + hT(l, "label", 'for="' + i + '"');}
function hInputH(i,n,v,a) {return hInput("hidden",i,n,v,a);}
function hInputB(i,n,v,a) {return hInput("button",i,n,v,a);}
function hInputC(i,n,v,a) {return hInput("checkbox",i,n,v,a);}
function hInputT(i,n,v,a) {return hInput("text",i,n,v,a);}
function hInputP(i,n,v,a) {return hInput("password",i,n,v,a);}
function hButton(t,l,n,v,a) {return hT(l, 'button', hArg('type', t) + hArg('value', v) + hArg('name', n) + (a?" " + a:""));}
function hButtonS(l,n,v) {return hButton('submit',l,n,v);}
function hFRow(l,c,h) {return hTr(hTd(hB(l)) + hTd(c) + (h?hTd(h):''));}
function ce(c, t) {
	var e = dc.createElement(t ? t : 'div');
	if(c) e.className = c;
	return e;
}
function ge(id) {return dc.getElementById(id);}
function gt(o, tag) {return o.getElementsByTagName(tag);}
function euri(v) {return encodeURIComponent(v);}
function duri(v) {return decodeURIComponent(v);}
function uri(v) {return euri(v).replace(/%20/g,'+');}
function escp(v) {return v.replace(/\\/g,'\\\\').replace(/\"/g,'\\\"');}
function sh(e,v) {e.innerHTML = v;}
function gv(e) {return e.value;}
function sv(e,v) {e.value = v;}
function ric(r) {
	var i = 0;
	return function() {return r.insertCell(i++);};
}

function getFormValue(e) {
	var t = null;
	if(e.length != null) t = e[0].type;
	if(!t) t = e.type;
	if(!t) return null;

	switch(t) {
	case 'radio':
		for(var i = 0; i < e.length; ++i) {
			if(e[i].checked) return gv(e[i]);
		}
		return null;
	case 'select-multiple':
		var r = [];
		for(var i = 0; i < e.length; ++i) {
			if(e[i].selected) r.push(gv(e[i]));
		}
		return r.join(',');
	case 'checkbox':
		return e.checked;
	default:
		return gv(e);
	}
}

function getEncodeType(n) {
	if(n == 'l' || n == 'f') return 2;
	if(n == 'p' || n == 'i' || n == 'v' || n == 'u') return 0;
	return 1;
}

function getForm(f, m, eq) {
	var r = [];
	var n = false;
	function p(v) {r.push(v);}
	p('{');
	for(var i = 0; i < f.elements.length; ++i) {
		var e = f.elements[i];
		if(!e.name) continue;
		var v = getFormValue(e);
		if(m) v = m(f, e.name, v);
		if(!v) continue;
		if(n) p(',');
		p('"' + e.name + '"' + eq);
		if(v === true) {
			p(1);
		} else if(v === false) {
			p(0);
		} else if(typeof v.replace === 'undefined') {
			p(v);
		} else {
			var t = getEncodeType(e.name);
			if(t > 0) {
				p('"' + (t > 1 ? euri(v) : escp(v)) + '"');
			} else {
				p(v);
			}
		}
		n = true;
	}
	p('}');
	return r.join("");
}

function getFormJson(f, m) {
	return getForm(f, m, ":");
}

function postForm(f, u, v, vv, r, h, m) {
	if(v) {
		if(!v(f, vv)) return false;
	}
	var d = getFormJson(f, m);
	http(u, d, function(re, s) {
		if(!empty(r)) {
			sh(ge(r), re);
		}
		if(h) h(re, s);
	});
	return false;
}

function crc16(a) {
	// algorithm taken from Dooya RS485 spec
	var d = [0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401, 0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400];
	var r = 0xFFFF;
	for(var i = 0; i < a.length; ++i) {
		var c = a[i];
		var t = (r & 0xF) ^ (c & 0xF);
		r >>= 4;
		r ^= d[t];
		t = (r & 0xF) ^ (c >> 4);
		r >>= 4;
		r ^= d[t];
	}
	return r;
}

function parseHs(s) {
	var p = s ? s.split(/[\s,]/) : [];
	var r = [];
	for(var i = 0; i < p.length; ++i) {
		var t = p[i];
		if(t && t.length > 0) r = r.concat(t.match(/.{1,2}/g));
	}
	return r;
}

function hs2i(s) {
	return Number("0x" + s.replace(/^#/, ''));
}

function hs2a(s) {
	var a = parseHs(s);
	var res = [];
	for(var i = 0; i < a.length; ++i) {
		var v = hs2i(a[i]);
		if(isNaN(v) || v < 0 || v > 255) throw '"' + a[i] + '" is not a hex byte (hexByte[' + i + '])';
		res.push(v);
	}
	return res;
}

function b2hs(i) {
	i = Number(i);
	return (i < 0x10 ? "0" : "") + i.toString(16);
}

function ba2hs(a, s) {
	var r = [];
	for(var i = 0; i < a.length; ++i) {
		r.push(b2hs(a[i]));
	}
	return r.join(s ? s : "");
}

function hexCrc(h, c, s) {
	var a = hs2a(h);
	if(c) {
		var r = crc16(a);
		a.push(r & 0xFF);
		a.push((r & 0xFF00) >> 8);
	}
	return ba2hs(a, s);
}
