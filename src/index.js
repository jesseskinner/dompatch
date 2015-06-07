module.exports = (function () {
'use strict';

var diff;

var domStateTest = /^(value|checked|selected)$/i;

function each(list, callback) {
	for (var i = 0; i < list.length; i++) {
		callback(list[i], i);
	}
}

function remove(element) {
	element.parentNode.removeChild(element);
	return element;
}

function replace(element, newElement) {
	newElement = newElement.cloneNode(newElement);
	element.parentNode.insertBefore(newElement, element);
	return remove(element);
}

function nodeCheck(element, newElement) {
	if (element.nodeName !== newElement.nodeName
			|| element.nodeType !== newElement.nodeType) {
		return replace(element, newElement);
	}
}

function attributes(element, newElement) {
	if (element.setAttribute && element.removeAttribute
			&& element.attributes && newElement.attributes) {

		// remove any attributes that aren't on the new newElement
		each(element.attributes, function (attr) {
			if (!newElement.hasAttribute(attr.name) &&
					!domStateTest.test(attr.name)) {
				element.removeAttribute(attr.name);
			}
		});

		each(newElement.attributes, function (attr) {
			element.setAttribute(attr.name, attr.value);
		});
	}
}

function children(element, newElement) {
	var newChildren = newElement.childNodes,
		childNodes = element.childNodes;

	if (newChildren) {
		if (childNodes) {
			// remove any excess child nodes
			while (childNodes.length > newChildren.length) {
				remove(childNodes[childNodes.length - 1]);
			}
		}

		if (newChildren.length) {
			// add any needed child nodes
			while (childNodes.length < newChildren.length) {
				element.appendChild(newChildren[childNodes.length].cloneNode(true));
			}

			// iterate into each child
			each(newChildren, function (child, i) {
				diff(childNodes[i], child);
			});
		}
	}
}

function text(element, newElement) {
	if (element.nodeType === 3) {
		element.nodeValue = newElement.nodeValue;
	}
}

diff = function (element, newElement) {
	if (!element) {
		throw new Error('element is required');
	}

	if (!newElement) {
		return remove(element);
	}

	if (!nodeCheck(element, newElement)) {
		attributes(element, newElement);
		text(element, newElement);
		children(element, newElement);
	}
};

function rootNode(document) {
	if (document.body) {
		return document.body;
	}
	return document;
}

function domdiff(document, newDocument) {
	// update document.title as a special other thing
	document.title = newDocument.title;

	// find root elements (eg. body) we can start iterating into
	diff(rootNode(document), rootNode(newDocument));
}

return domdiff;

})();
