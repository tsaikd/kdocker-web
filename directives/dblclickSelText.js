app

.factory("SelectRange"
	, [       "$rootScope"
	, function($rootScope) {

	function SelectRange() {}
	var $scope = new SelectRange();

	// http://stackoverflow.com/questions/6240139/highlight-text-range-using-javascript
	SelectRange.prototype.getTextNodesIn = function(node) {
		var textNodes = [];
		if (node.nodeType == 3) {
			textNodes.push(node);
		} else {
			var children = node.childNodes;
			for (var i = 0, len = children.length; i < len; ++i) {
				textNodes.push.apply(textNodes, $scope.getTextNodesIn(children[i]));
			}
		}
		return textNodes;
	};

	SelectRange.prototype.setSelectionRange = function(el, start, end) {
		if (el.setSelectionRange && el.select) {
			if (start === undefined || end === undefined) {
				el.select();
			} else {
				el.setSelectionRange(start, end);
			}
		} else if (document.createRange && window.getSelection) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var textNodes = $scope.getTextNodesIn(el);
			var foundStart = false;
			var charCount = 0, endCharCount;

			for (var i = 0, textNode; textNode = textNodes[i++]; ) {
				endCharCount = charCount + textNode.length;
				if (!foundStart && start >= charCount
						&& (start < endCharCount ||
						(start == endCharCount && i < textNodes.length))) {
					range.setStart(textNode, start - charCount);
					foundStart = true;
				}
				if (foundStart && end <= endCharCount) {
					range.setEnd(textNode, end - charCount);
					break;
				}
				charCount = endCharCount;
			}

			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (document.selection && document.body.createTextRange) {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(true);
			textRange.moveEnd("character", end);
			textRange.moveStart("character", start);
			textRange.select();
		}
	};

	return $scope;
}])

.directive("ngDblclickSelText"
	, [       "SelectRange"
	, function(SelectRange) {
	return {
		restrict: "CA",
		link: function(scope, elem, attrs) {
			elem.on("dblclick", function() {
				SelectRange.setSelectionRange(elem[0]);
			});
		}
	};
}])

.directive("ngClickSelText"
	, [       "SelectRange"
	, function(SelectRange) {
	return {
		restrict: "CA",
		link: function(scope, elem, attrs) {
			elem.on("click", function() {
				SelectRange.setSelectionRange(elem[0]);
			});
		}
	};
}])

;
