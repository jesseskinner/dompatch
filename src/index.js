module.exports = function (undefined) {

function patch(element, newElement, compareElement, options,
	// local variables
	i, content, newNodes, compareNodes, newLength, compareLength, name, attrs) {

	// allow hook to prevent doing anything on these nodes
	if (!options.shouldUpdate || options.shouldUpdate(compareElement, newElement)) {
		content = newElement.nodeType;

		// if the node name or type changed, just replace this node
		if (compareElement.nodeType !== content
				|| compareElement.nodeName !== newElement.nodeName) {

			element.parentNode.replaceChild(newElement.cloneNode(true), element);

		// update node value, if a text or comment node
		} else if (content === 3 || content === 8) {
			element.nodeValue = newElement.nodeValue;

		} else {

			// update attributes, if a dom node
			if (content === 1) {
				attrs = {};
				newNodes = newElement.attributes;
				compareNodes = compareElement.attributes;

				// copy the attributes over to an object for comparison
				for (i = compareNodes.length - 1; i >= 0; i--) {
					content = compareNodes[i];
					attrs[content.name] = content.value;
				}

				for (i = newNodes.length - 1; i >= 0; i--) {
					content = newNodes[i];
					name = content.name;
					content = content.value;

					// if the value is different, update
					if (attrs[name] !== content) {
						element.setAttribute(name, content);
					}

					// remove from list
					delete attrs[name];
				}

				// remove all the attributes remaining
				for (name in attrs) {
					element.removeAttribute(name);
				}
			}

			// allow hook to prevent iterating into the children
			if (!options.shouldChildrenUpdate ||
					options.shouldChildrenUpdate(compareElement, newElement)) {

				// update children
				newNodes = newElement.childNodes;
				compareNodes = compareElement.childNodes;
				newLength = newNodes ? newNodes.length : 0;
				compareLength = compareNodes ? compareNodes.length : 0;

				// remove any excess child nodes
				if (compareLength > newLength) {
					for (i = compareLength - 1; i >= newLength; i--) {
						element.removeChild(element.childNodes[i]);
					}
				}

				// iterate over existing children
				for (i = 0; i < Math.min(compareLength, newLength); i++) {
					patch(element.childNodes[i], newNodes[i], compareNodes[i], options);
				}

				// copy over any new child nodes
				if (compareLength < newLength) {
					for (i = compareLength; i < newLength; i++) {
						element.appendChild(newNodes[i].cloneNode(true));
					}
				}
			}
		}
	}
}

// use the body if it's a document, otherwise use the node itself
function rootNode(document) {
	return document.body || document;
}

function dompatch (document, newDocument, options) {
	options = options || {};

	// update document.title as a special other thing
	if (newDocument.title) {
		document.title = newDocument.title;
	}

	// TODO - handle other <head> updates?

	// find root node (eg. body) we can start iterating into
	patch(
		rootNode(document),
		rootNode(newDocument),
		rootNode(options.compare || document),
		options
	);
}

return dompatch;

}();
