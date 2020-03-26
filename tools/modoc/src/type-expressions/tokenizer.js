// jshint node:true
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var makeToken = function makeToken(type, data) {
	var token = { type: type };
	if (data) {
		token.data = data;
	}
	return token;
};

var isIdentifier = function isIdentifier(char) {
	return (/[_?\w\.]/.test(char)
	);
};

var isSymbol = function isSymbol(char) {
	return (/[*:,|(){}<>\[\]]/.test(char)
	);
};

var chopIdentifier = function chopIdentifier(string, offset) {
	var result = /^((?:\?|\.{3})?)([_A-Za-z][.\w]*[\w]?)(=?)/.exec(string.substr(offset));

	var token = makeToken('identifier', result[2]);

	// nullable/optional notations should be handled by the parser, not the lexer
	// but this a tad simpler
	if (result[1]) {
		token.nullable = true;
	}
	if (result[3]) {
		token.optional = true;
	}

	return {
		token: token,
		pointer: offset + result[0].length
	};
};

var chopSymbol = function chopSymbol(string, offset) {
	return {
		token: makeToken('symbol', string[offset]),
		pointer: offset + 1
	};
};

var choppers = [{ test: isIdentifier, chop: chopIdentifier }, { test: isSymbol, chop: chopSymbol }];

var tokenize = function tokenize(string) {
	var tokens = [];
	var pointer = 0;

	while (pointer < string.length) {
		var current = string[pointer];

		for (var i = 0; i < choppers.length; i++) {
			var chopper = choppers[i];
			if (chopper.test(current)) {
				var result = chopper.chop(string, pointer);
				tokens.push(result.token);
				pointer = result.pointer;
				break;
			}
		}

		// no chopper matched - treat as whitespace
		if (i >= choppers.length) {
			pointer++;
		}
	}

	return tokens;
};

var _makeToken;

_makeToken = makeToken;
var tokenize_tokenize = tokenize;
exports.tokenize = tokenize_tokenize;
