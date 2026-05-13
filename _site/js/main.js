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