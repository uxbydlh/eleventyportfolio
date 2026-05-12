// Thank you to https://github.com/daviddarnes/heading-anchors
// Thank you to https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/

let globalInstanceIndex = 0;

class HeadingAnchors extends HTMLElement {
	static register(tagName) {
		if ("customElements" in window) {
			customElements.define(tagName || "heading-anchors", HeadingAnchors);
		}
	}

	static attributes = {
		exclude: "data-ha-exclude",
		prefix: "prefix",
		content: "content",
	}

	static classes = {
		anchor: "ha",
		placeholder: "ha-placeholder",
		srOnly: "ha-visualhide",
	}

	static defaultSelector = "h2,h3,h4,h5,h6";

	static css = `
.${HeadingAnchors.classes.srOnly} {
	clip: rect(0 0 0 0);
	height: 1px;
	overflow: hidden;
	position: absolute;
	width: 1px;
}
.${HeadingAnchors.classes.anchor} {
	position: absolute;
	left: var(--ha_offsetx);
	top: var(--ha_offsety);
	text-decoration: none;
	opacity: 0;
}
.${HeadingAnchors.classes.placeholder} {
	opacity: .3;
}
.${HeadingAnchors.classes.anchor}:is(:focus-within, :hover) {
	opacity: 1;
}
.${HeadingAnchors.classes.anchor},
.${HeadingAnchors.classes.placeholder} {
	display: inline-block;
	padding: 0 .25em;

	/* Disable selection of visually hidden label */
	-webkit-user-select: none;
	user-select: none;
}

@supports (anchor-name: none) {
	.${HeadingAnchors.classes.anchor} {
		position: absolute;
		left: anchor(left);
		top: anchor(top);
	}
}`;

	get supports() {
		return "replaceSync" in CSSStyleSheet.prototype;
	}

	get supportsAnchorPosition() {
		return CSS.supports("anchor-name: none");
	}

	constructor() {
		super();

		if(!this.supports) {
			return;
		}

		let sheet = new CSSStyleSheet();
		sheet.replaceSync(HeadingAnchors.css);
		document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

		this.headingStyles = {};
		this.instanceIndex = globalInstanceIndex++;
	}

	connectedCallback() {
		if (!this.supports) {
			return;
		}

		this.headings.forEach((heading, index) => {
			if(!heading.hasAttribute(HeadingAnchors.attributes.exclude)) {
				let anchor = this.getAnchorElement(heading);
				let placeholder = this.getPlaceholderElement();

				// Prefers anchor position approach for better accessibility
				// https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/
				if(this.supportsAnchorPosition) {
					let anchorName = `--ha_${this.instanceIndex}_${index}`;
					placeholder.style.setProperty("anchor-name", anchorName);
					anchor.style.positionAnchor = anchorName;
				}

				heading.appendChild(placeholder);
				heading.after(anchor);
			}
		});
	}

	// Polyfill-only
	positionAnchorFromPlaceholder(placeholder) {
		if(!placeholder) {
			return;
		}

		let heading = placeholder.closest("h1,h2,h3,h4,h5,h6");
		if(!heading.nextElementSibling) {
			return;
		}

		// TODO next element could be more defensive
		this.positionAnchor(heading.nextElementSibling);
	}

	// Polyfill-only
	positionAnchor(anchor) {
		if(!anchor || !anchor.previousElementSibling) {
			return;
		}

		// TODO previous element could be more defensive
		let heading = anchor.previousElementSibling;
		this.setFontProp(heading, anchor);

		if(this.supportsAnchorPosition) {
			// quit early
			return;
		}

		let placeholder = heading.querySelector(`.${HeadingAnchors.classes.placeholder}`);
		if(placeholder) {
			anchor.style.setProperty("--ha_offsetx", `${placeholder.offsetLeft}px`);
			anchor.style.setProperty("--ha_offsety", `${placeholder.offsetTop}px`);
		}
	}

	setFontProp(heading, anchor) {
		let placeholder = heading.querySelector(`.${HeadingAnchors.classes.placeholder}`);
		if(placeholder) {
			let style = getComputedStyle(placeholder);
			let props = ["font-weight", "font-size", "line-height", "font-family"];
			let font = props.map(name => style.getPropertyValue(name));
			anchor.style.setProperty("font", `${font[0]} ${font[1]}/${font[2]} ${font[3]}`);
		}
	}

	getAccessibleTextPrefix() {
		// Useful for i18n
		return this.getAttribute(HeadingAnchors.attributes.prefix) || "Jump to section titled";
	}

	getContent() {
		if(this.hasAttribute(HeadingAnchors.attributes.content)) {
			return this.getAttribute(HeadingAnchors.attributes.content);
		}
		return "#";
	}

	// Placeholder nests inside of heading
	getPlaceholderElement() {
		let ph = document.createElement("span");
		ph.setAttribute("aria-hidden", true);
		ph.classList.add(HeadingAnchors.classes.placeholder);
		let content = this.getContent();
		if(content) {
			ph.textContent = content;
		}

		ph.addEventListener("mouseover", (e) => {
			let placeholder = e.target.closest(`.${HeadingAnchors.classes.placeholder}`);
			if(placeholder) {
				this.positionAnchorFromPlaceholder(placeholder);
			}
		});

		return ph;
	}

	getAnchorElement(heading) {
		let anchor = document.createElement("a");
		anchor.href = `#${heading.id}`;
		anchor.classList.add(HeadingAnchors.classes.anchor);

		let content = this.getContent();
		anchor.innerHTML = `<span class="${HeadingAnchors.classes.srOnly}">${this.getAccessibleTextPrefix()}: ${heading.textContent}</span>${content ? `<span aria-hidden="true">${content}</span>` : ""}`;

		anchor.addEventListener("focus", e => {
			let anchor = e.target.closest(`.${HeadingAnchors.classes.anchor}`);
			if(anchor) {
				this.positionAnchor(anchor);
			}
		});

		anchor.addEventListener("mouseover", (e) => {
			// when CSS anchor positioning is supported, this is only used to set the font
			let anchor = e.target.closest(`.${HeadingAnchors.classes.anchor}`);
			this.positionAnchor(anchor);
		});

		return anchor;
	}

	get headings() {
		return this.querySelectorAll(this.selector.split(",").map(entry => `${entry.trim()}[id]`));
	}

	get selector() {
		return this.getAttribute("selector") || HeadingAnchors.defaultSelector;
	}
}

HeadingAnchors.register();

export { HeadingAnchors }
/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) =>{
   const toggle = document.getElementById(toggleId),
         nav = document.getElementById(navId)

   toggle.addEventListener('click', () =>{
       // Add show-menu class to nav menu
       nav.classList.toggle('show-menu')
       
       // Add show-icon to show and hide the menu icon
       toggle.classList.toggle('show-icon')

       // Close all submenus
       closeAllSubMenus();
       
   })
}

showMenu('nav-toggle','nav-menu');

const showSubMenu = (submenuId) => {
    const subLink = document.getElementById(submenuId);

    subLink.addEventListener('click', () => {
        if(window.innerWidth < 1118) {
            //Print
            console.log("Clicked on " + subLink.ELEMENT_NODE.toString);
            //Get parent element of sublink
            var subMenu = subLink.parentElement;
            //Print parent
            console.log(subMenu.ELEMENT_NODE.toString);
            //Add "show-sub" class to submenu
            subMenu.classList.toggle('show-sub');
        }
    });
    
}

const subMenuList = document.querySelectorAll('[id^="dropdown"]');

function makeSubMenusClickable() {
    for(const menu of subMenuList){
        showSubMenu(menu.id);
    }
}

makeSubMenusClickable();

function closeAllSubMenus(){
    for(const menu of subMenuList){
        menu.parentElement.classList.remove('show-sub');
    }
}

//Close menus on screen resize
function closeMenu(toggleId, navId) {
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId);

    nav.classList.remove('show-menu');
    toggle.classList.remove('show-icon');
    closeAllSubMenus();
}

function checkWindowSize() {
    if(window.innerWidth > 1118){
        closeMenu('nav-toggle', 'nav-menu');
    }
}

window.onresize = checkWindowSize;
(showDivs(slideIndex, 'DHH1'));
(showDivs(slideIndex, 'DHH2'));
(showDivs(slideIndex, 'DHH3'));
(showDivs(slideIndex, 'DHH4'));
(showDivs(slideIndex, 'DHH5'));
(showDivs(slideIndex, 'DHH6'));
(showDivs(slideIndex, 'DHH7'));
(showDivs(slideIndex, 'DHH8'));
(showDivs(slideIndex, 'DHH9'));
(showDivs(slideIndex, 'DHH10'));
(showDivs(slideIndex, 'DHH11'));
(showDivs(slideIndex, 'DHH12'));
(showDivs(slideIndex, 'DHH13'));
(showDivs(slideIndex, 'DHH14'));
(showDivs(slideIndex, 'DHH15'));
(showDivs(slideIndex, 'DHH16'));
(showDivs(slideIndex, 'DHH17'));
(showDivs(slideIndex, 'desktopCarousel'));
(showDivs(slideIndex, 'mobileCarousel'));
var potentialDropdowns = document.querySelectorAll("nav.toc ol li");
    var potentialDropdownsCopy = Array.from(potentialDropdowns);

    function hasChildren(obj, index, arr) {
        return obj.children.length > 1;
    }

	var listsWithKids = potentialDropdownsCopy.filter(hasChildren);
    console.log(listsWithKids);

    listsWithKids.forEach(element => {
        element.classList.add("contentParent");
        element.classList.add("closed");

        //wrap "opener link" in a summary parent tag
        let linkChild = element.firstChild;
        $(linkChild).wrap('<div class="toc_nav_link"></div>');
        $('<i class="ri-arrow-down-s-fill"></i>').insertBefore(linkChild);

        //provide function to the parent tag
        linkChild.parentNode.addEventListener("click", function() {
            element.classList.toggle("closed");
        });
    });

    ;(function($) {
         $('.swipebox').swipebox();
      }) (jQuery);
document.getElementById("currentYear").innerHTML = new Date().getFullYear();