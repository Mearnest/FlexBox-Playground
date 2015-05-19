// Find a css rule in any style sheet on the document based on the selector text
function findCSSRule(selector) {
	var styleSheets = document.styleSheets;
	var rules;

	for (var i=0; i<styleSheets.length; i++) {
		rules = styleSheets[i].rules || styleSheets[i].cssRules;

		for (j=0; j<rules.length; j++) {
			if (rules[j].selectorText == selector) {
				return rules[j];
			}
		}
	}
}


// When clicking an item, the color style properties are in rgb format, but the color input fields require hex.
function rgbToHex(color) {
	if (color.substr(0, 1) === '#') {
		return color;
	}
	var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

	var red = parseInt(digits[2]);
	var green = parseInt(digits[3]);
	var blue = parseInt(digits[4]);

	var rgb = blue | (green << 8) | (red << 16);
	return digits[1] + '#' + rgb.toString(16);
}


var $qs =  document.querySelector.bind(document);
var $qsa = document.querySelectorAll.bind(document);
window.addEventListener("load", onLoad);

function onLoad() {
    
	var main = $qs("main");
	var items = [];  // List of items
	var itemsWidth = $qs("input[name='itemsWidth']");
	var itemsHeight = $qs("input[name='itemsHeight']");
	var itemNumber = $qs("number");
	var itemColor = $qs("input[name='color']");
	var itemBGColor = $qs("input[name='backgroundColor']");
	var itemWidth = $qs("input[name='width']");
	var itemHeight = $qs("input[name='height']");
	var itemOrder = $qs("input[name='order']");
	var itemFlexGrow = $qs("input[name='flexGrow']");
	var itemFlexShrink = $qs("input[name='flexShrink']");
	var itemFlexBasis = $qs("input[name='flexBasis']");
	var itemAlign = $qs("select[name='alignSelf']");
	var itemBGImage = $qs("select[name='backgroundImage']");
	var itemVideo = $qs("select[name='video']");
	var itemContext = $qs("textarea");

	// Add stylesheet for modifying css globally instead on a per node (html inline) basis
	var style = document.createElement("style"); 
	document.head.appendChild(style);
	sheet = style.sheet; 

	// FF does it different
	if (!sheet.rules) {
		sheet.rules = sheet.cssRules;
	}

	// Rule indexes
	var mainIndex = 0;
	var itemsIndex = 1; 

	// Insert the skeleton rules for future modification
	sheet.insertRule("main {  }", mainIndex);
	sheet.insertRule("main div {  }", itemsIndex);

	// Rules to modify 
	var defaultItemsRule = findCSSRule("main div"); // css properties set in style.css
	var mainRule = sheet.rules[mainIndex];
	var itemsRule = sheet.rules[itemsIndex];
	var itemRuleSelector = "main div:nth-child("; // Individual rule: add number and close parens


	// When items are added or removed, update the list
	function updateItemList() {
		items = $qsa("main div");
		for (var i=0; i<items.length; i++) {
			items[i].addEventListener("click", itemClick);
		}
	}

	// Add new items or remove existing items depending on the number vs existing ones.
	function modifyNumItems(num) {
		var rule; // css rule to insert for new items

		if (num > items.length) {
			// Add in extra divs
			for (i=items.length+1; i<=num; i++) {
				item = document.createElement("div");
				text = document.createTextNode(i);
				item.appendChild(text);

				item.number = i;
				main.appendChild(item);

				// In order to modify individual item's css properties without inlining,
				// create an n-th-child rule to hold those properties, if it doesn't exist.
				rule = itemRuleSelector + (i) + ")";
				if (!findCSSRule(rule)) {
					rule += "{ order: " + i + "; }";
					sheet.insertRule(rule, sheet.rules.length);
				}
			}
		}
		else if (num < items.length) {
			// Remove divs	
			for (i=num; i<items.length; i++) {
				items[i].remove();
			}
		}

		// Update divs
		updateItemList();
		itemNumber.focus();
	}

	/*** 	Event Handlers 	***/
	function itemClick(e) {
		var number = this.number;
		var content = this.innerHTML;
		var style = itemsRule.style;
		var defaultStyle = defaultItemsRule.style;
		var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;

		var color = itemStyle.color || defaultStyle.color;
		var bgColor = itemStyle.backgroundColor || defaultStyle.backgroundColor;
		var bgImage = itemStyle.backgroundImage;
		var width = itemStyle.width || style.width || defaultStyle.width;
		var height = itemStyle.height || style.height || defaultStyle.height;
		var order = itemStyle.order;
		var flexGrow = itemStyle.flexGrow || style.flexGrow || defaultStyle.flexGrow;
		var flexShrink = itemStyle.flexShrink || style.flexShrink || defaultStyle.flexShrink;
		var flexBasis = itemStyle.flexBasis || style.flexBasis || defaultStyle.flexBasis;
		var align = itemStyle.alignSelf;
        var num;

		// Convert colors to hex values
		color = rgbToHex(color);
		bgColor = rgbToHex(bgColor);
        
       // Set all items to default border for clearing previous highlighted item.
		// for (var i=0; i<items.length; i++) {
            // num = items[i].number;
            // findCSSRule(itemRuleSelector + num+ ")").style.borderColor = "gray";
		// }
        
         // Highlight the selected item
        // itemStyle.borderColor = "gold"; 

		itemNumber.innerHTML = number;
		itemColor.value = color;
		itemBGColor.value = bgColor;
		itemWidth.value = width;
		itemHeight.value = height;
		itemOrder.value = order;
		itemFlexGrow.value = flexGrow;
		itemFlexShrink.value = flexShrink;
		itemFlexBasis.value = flexBasis;
		itemContext.value = content;
		itemAlign.value = align;

		var options = itemBGImage.options;
		var pattern;
		for (var i=1; i<options.length; i++) {
			pattern = new RegExp(options[i].value);

			if (bgImage.match(pattern)) {
				itemBGImage.selectedIndex = i;
				return;
			}
		}
		itemBGImage.selectedIndex = 0;  // Fall through set to first item

		// If this item contains a video, match it with the video list
		if (content.match(/video src=/)) {
			var options = itemVideo.options;
			var pattern;
			for (var i=1; i<options.length; i++) {
				pattern = new RegExp(options[i].value);

				if (content.match(pattern)) {
					itemVideo.selectedIndex = i;
					return;
				}
			}
			itemVideo.selectedIndex = 0;  // Fall through set to first item
		}
		else {
			itemVideo.selectedIndex = 0;
		}

		itemNumber.focus();
	}

	function flexItemsClick(e) {
		var number = itemNumber.innerHTML;
		var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;  // Find the individual item's rule

		if (this.checked) {
			itemsRule.style.flex = "1 1 20%";
			itemsRule.style.height = "initial";
			itemsRule.style.width = "initial";

			itemsWidth.disabled = true;
			itemsHeight.disabled = true;

			itemWidth.value = itemStyle.width || "initial";
			itemHeight.value = itemStyle.height || "initial";
			itemFlexGrow.value = itemStyle.flexGrow || 1;
			itemFlexShrink.value = itemStyle.flexShrink || 1;
			itemFlexBasis.value = itemStyle.flexShrink || "20%";
		}
		else {
			itemsRule.style.flex = "none";
			itemsRule.style.width = itemsWidth.value;
			itemsRule.style.height = itemsHeight.value;

			itemsWidth.disabled = false;
			itemsHeight.disabled = false;

			itemWidth.value = itemStyle.width || itemsWidth.value;
			itemHeight.value = itemStyle.height || itemsHeight.value;
			itemFlexGrow.value = itemStyle.flexGrow || 0;
			itemFlexShrink.value = itemStyle.flexShrink || 0;
			itemFlexBasis.value = itemStyle.flexShrink || "auto";
		}
	}

	// set number Items or item order
	function numberChange(e) {
		var min = parseInt(this.min);
		var max = parseInt(this.max)
		var value = parseInt(this.value);

		if (value < min || value > max) {
			alert(value + " exceeds limit: minimum " + min + ", maximum: " + max);
			return false;
		}

		if (this.name == "numberItems") {
			modifyNumItems(value);
		}
		else {
			var number = itemNumber.innerHTML;
			var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;  // Find the individual item's rule
			itemStyle.order = this.value;
		}
	}

	// Text Fields
	function setStyleProperty(e) {
		var property = this.name;

		if (property.match("items")) {
			property = property.replace("items", "").toLowerCase();
			itemsRule.style[property] = this.value;
		}
		else if(property.match("main")) {
			property = property.replace("main", "").toLowerCase();
			mainRule.style[property] = this.value;
		}
		else {
			var number = itemNumber.innerHTML;
			var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;  // Find the individual item's rule
			itemStyle[property] = this.value;
		}
	}

	// Set Main's Flex property
	function setMainFlex(e) {
		var property = this.name;
		mainRule.style[property] = this.value;
	}

	// Set color or background color
	function setItemColor(e) {
		var number = itemNumber.innerHTML;
		var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;  // Find the individual item's rule
		var property = this.name;

		itemStyle[property] = this.value;
	}

	// Set individual item background image
	function setItemImage(e) {
		var number = itemNumber.innerHTML;
		var itemStyle = findCSSRule(itemRuleSelector + number + ")").style;  // Find the individual item's rule
		var property = this.name;
		var value = this.value;

		if (value) {
			itemStyle.backgroundImage = "url(img/" + value + ")";
		}
		else {
			itemStyle.backgroundImage = "";
		}
	}

	function setItemVideo(e) {
		var number = itemNumber.innerHTML;
		var item = $qs(itemRuleSelector + number + ")");
		item.innerHTML = '<video src="video/' + this.value + '" controls autoplay></video>';
	}

	function setItemContent(e) {
		var number = itemNumber.innerHTML;
		var item = $qs(itemRuleSelector + number + ")");
		item.innerHTML = this.value;
	}


	// Initialize main with six items
	modifyNumItems(6);


	/***	Event Handlers	***/
	var flexItems = $qs("input[name='flexItems']");
	flexItems.addEventListener("click", flexItemsClick);

	var numberFields = $qsa("input[type='number']");
	for (var i=0; i<numberFields.length; i++) {
		numberFields[i].addEventListener("change", numberChange);
	}

	var textInputs = $qsa("input[type='text'],select[name='alignSelf']");
	for (i=0; i<textInputs.length; i++) {
		textInputs[i].addEventListener("change", setStyleProperty);
	}

	var radioInputs = $qsa("input[type='radio']");
	for (i=0; i<radioInputs.length; i++) {
		radioInputs[i].addEventListener("click", setMainFlex);
	}

	var colorInputs = $qsa("input[type='color']");
	for (i=0; i<colorInputs.length; i++) {
		colorInputs[i].addEventListener("change", setItemColor);
	}

	var select = $qs("select[name='backgroundImage']");
	select.addEventListener("change", setItemImage);

	var video = $qs("select[name='video']");
	video.addEventListener("change", setItemVideo);

	var itemContent = $qs("textarea");
	itemContent.addEventListener("change", setItemContent);

	// Set initial item properties
	items[0].click();
    // findCSSRule(itemRuleSelector + items[0].number + ")").style.borderColor = "gray";
	itemNumber.blur();
}