'use strict';

var expect = require('chai').expect;
var dompatch = require('../src/index');
var DOMParser = require('xmldom').DOMParser;

function doc(html) {
	return new DOMParser().parseFromString(html, 'text/html');
}

describe('dompatch', function () {
	it('should be a function', function () {
		expect(dompatch).to.be.a('function');
	});

	it('can handle attributes', function () {
		var document = doc('<div></div>'),
			div = document.getElementsByTagName('div')[0],

			newDocument = doc('<div id="yay" style="color:red"></div>');

		dompatch(document, newDocument);

		expect(div.getAttribute('id')).to.equal('yay');
		expect(div.getAttribute('style')).to.equal('color:red');
	});

	it('can handle new structures', function () {
		var document = doc('<div></div>');
		var newDocument = doc('<p><br></p>');

		dompatch(document, newDocument);

		expect(document.getElementsByTagName('div').length).to.equal(0);
		expect(document.getElementsByTagName('p').length).to.equal(1);
		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle fewer children', function () {
		var document = doc('<div><br><br></div>');
		var newDocument = doc('<div><br></div>');

		dompatch(document, newDocument);

		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle more children', function () {
		var document = doc('<div></div>');
		var newDocument = doc('<div><br></div>');

		dompatch(document, newDocument);

		expect(document.getElementsByTagName('br').length).to.equal(1);
	});

	it('can handle fewer attributes', function () {
		var document = doc('<div data-one="1" data-two="2"></div>'),
			div = document.getElementsByTagName('div')[0],

			newDocument = doc('<div data-one="1"></div>');

		dompatch(document, newDocument);

		expect(div.hasAttribute('data-one')).to.equal(true);
		expect(div.hasAttribute('data-two')).to.equal(false);
	});

	it('can handle text', function () {
		var document = doc('<div>Hello, World</div>'),
			text = document.getElementsByTagName('div')[0].childNodes[0],

			newDocument = doc('<div>Hi wrld</div>');

		dompatch(document, newDocument);

		expect(text.nodeValue).to.equal('Hi wrld');
	});

	it('can switch to text', function () {
		var document = doc('<div><br></div>'),
			div = document.getElementsByTagName('div')[0],

			newDocument = doc('<div>hi</div>');

		dompatch(document, newDocument);

		expect(div.childNodes[0].nodeValue).to.equal('hi');
	});

	it('can do entities', function () {
		var document = doc('<div></div>'),
			div = document.getElementsByTagName('div')[0],

			newDocument = doc('<div>&copy;</div>');

		dompatch(document, newDocument);

		expect(div.childNodes[0].nodeValue).to.equal('©');
	});

	it('will leave input values alone', function () {
		var document = doc('<div></div>');
		var firstDocument = doc('<div><input type="radio"><span>hi</span></div>');
		var secondDocument = doc('<div><input type="radio"><span>bye</span></div>');

		dompatch(document, firstDocument);

		document.getElementsByTagName('input')[0].setAttribute('checked', 'checked');

		dompatch(document, secondDocument, {
			compare: firstDocument
		});

		var span = document.getElementsByTagName('span')[0];
		var input = document.getElementsByTagName('input')[0];

		expect(span.childNodes[0].nodeValue).to.equal('bye');
		expect(input.getAttribute('checked')).to.equal('checked');
	});
});
