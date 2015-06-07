module.exports = (function () {
'use strict';

var diff;

function each(list, callback) {
	for (var i = 0; i < list.length; i++) {
		callback(list[i], i);
	}
}

function haveContentsChanged(before, after) {
	var beforeHtml = before.innerHTML;

	return (
		// on server-side, we don't have access to innerHTML
		// but then, we don't need this optimization either
		typeof beforeHtml === 'undefined'
			|| beforeHtml !== after.innerHTML
	);
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

function nodeCheck(element, newElement, compareElement) {
	if (compareElement.nodeName !== newElement.nodeName
			|| compareElement.nodeType !== newElement.nodeType) {
		return replace(element, newElement);
	}
}

function attributes(element, newElement, compareElement) {
	if (compareElement.setAttribute && compareElement.removeAttribute
			&& compareElement.attributes && newElement.attributes) {

		// remove any attributes that aren't on the new newElement
		each(compareElement.attributes, function (attr) {
			if (!newElement.hasAttribute(attr.name)) {
				element.removeAttribute(attr.name);
			}
		});

		each(newElement.attributes, function (attr) {
			element.setAttribute(attr.name, attr.value);
		});
	}
}

function children(element, newElement, compareElement) {
	var newChildren = newElement.childNodes,
		childNodes = element.childNodes,
		compareNodes = compareElement.childNodes,
		newLength = newChildren ? newChildren.length : 0,
		compareLength = compareNodes ? compareNodes.length : 0,
		i;

	if (newChildren) {
		if (childNodes) {
			// remove any excess child nodes
			if (compareLength > newLength) {
				for (i = compareLength - 1; i >= newLength; i--) {
					remove(childNodes[i]);
				}
			}
		}

		if (newLength) {
			// add any needed child nodes
			if (compareLength < newLength) {
				for (i = compareLength - 1; i < newLength - 1; i++) {
					element.appendChild(newChildren[compareLength].cloneNode(true));
				}
			}

			// iterate into each child
			each(newChildren, function (child, index) {
				diff(childNodes[index], child, compareNodes[index]);
			});
		}
	}
}

function text(element, newElement, compareElement) {
	if (compareElement.nodeType === 3) {
		element.nodeValue = newElement.nodeValue;
	}
}

diff = function (element, newElement, compareElement) {
	if (element) {
		if (!newElement) {
			remove(element);

		} else if (!nodeCheck(element, newElement, compareElement)) {
			attributes(element, newElement, compareElement);
			text(element, newElement, compareElement);

			if (haveContentsChanged(compareElement, newElement)) {
				children(element, newElement, compareElement);
			}
		}
	}
};

function rootNode(document) {
	return document.body || document;
}

function domdiff(document, newDocument, compareDocument) {
	// update document.title as a special other thing
	document.title = newDocument.title;

	// find root elements (eg. body) we can start iterating into
	diff(
		rootNode(document),
		rootNode(newDocument),
		rootNode(compareDocument || document)
	);
}

return domdiff;

})();
