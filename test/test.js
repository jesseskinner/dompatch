'use strict';

var expect = require('chai').expect;
var domdiff = require('../src/index');
var DOMParser = require('xmldom').DOMParser;

function parse(html) {
	return new DOMParser().parseFromString(html, 'text/html');
}

function doc(body) {
	return parse("<!doctype html>\n<html><body>" + body + '</body></html>');
}

describe('domdiff', function () {
	it('should be a function', function () {
		expect(domdiff).to.be.a('function');
	});

	it('can handle attributes', function () {
		var document = doc('<div></div>'),
			newDocument = doc('<div id="yay" style="color:red"></div>');

		domdiff(document, newDocument);

		var div = document.getElementsByTagName('div')[0];

		expect(div.getAttribute('id')).to.equal('yay');
		expect(div.getAttribute('style')).to.equal('color:red');
	});

	it('can handle new structures', function () {
		var document = doc('<div></div>');
		var newDocument = doc('<p><br></p>');

		domdiff(document, newDocument);

		expect(document.getElementsByTagName('div').length).to.equal(0);
		expect(document.getElementsByTagName('p').length).to.equal(1);
		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle fewer children', function () {
		var document = doc('<div><br><br></div>');
		var newDocument = doc('<div><br></div>');

		domdiff(document, newDocument);

		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle more children', function () {
		var document = doc('<div></div>');
		var newDocument = doc('<div><br></div>');

		domdiff(document, newDocument);

		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle fewer attributes', function () {
		var document = doc('<div data-one="1" data-two="2"></div>');
		var newDocument = doc('<div data-one="1"></div>');

		domdiff(document, newDocument);

		var div = document.getElementsByTagName('div')[0];

		expect(div.getAttribute('data-two')).to.equal('');
	});

	it('can handle text', function () {
		var document = doc('<div>Hello, World</div>');
		var newDocument = doc('<div>Hi wrld</div>');

		domdiff(document, newDocument);

		var div = document.getElementsByTagName('div')[0];

		expect(div.childNodes[0].nodeValue).to.equal('Hi wrld');
	});

	it('can switch to text', function () {
		var document = doc('<div><br></div>');
		var newDocument = doc('<div>hi</div>');

		domdiff(document, newDocument);

		var div = document.getElementsByTagName('div')[0];

		expect(div.childNodes[0].nodeValue).to.equal('hi');
	});

	it('can do entities', function () {
		var document = doc('<div></div>');
		var newDocument = doc('<div>&copy;</div>');

		domdiff(document, newDocument);

		var div = document.getElementsByTagName('div')[0];

		expect(div.childNodes[0].nodeValue).to.equal('©');
	});

	it('will leave input values alone', function () {
		var document = doc('<div><input type="radio"><span>hi</span></div>');
		var newDocument = doc('<div><input type="radio"><span>bye</span></div>');

		document.getElementsByTagName('input')[0].setAttribute('checked', 'checked');

		domdiff(document, newDocument, newDocument);

		var span = document.getElementsByTagName('span')[0];
		var input = document.getElementsByTagName('input')[0];

		expect(span.childNodes[0].nodeValue).to.equal('bye');
		expect(input.getAttribute('checked')).to.equal('checked');
	});
});
