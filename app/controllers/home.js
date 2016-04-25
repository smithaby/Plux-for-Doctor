var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var myClinic = Ti.App.Properties.getString('clinic_id');
console.log("HOME CLINIC => "+myClinic);

var menu_info = [
	{mod: "cardReader", image: "/images/btn/e-card-reader.png"},
	{mod: "patient", image: "/images/btn/patient-record.png"}, 
	{mod: "appointment", image: "/images/btn/appointment.png"},
	{mod: "clinic/listing", image: "/images/btn/clinic-locator.png"},
	{mod: "ida", image: "/images/btn/ida.png"},
	{mod: "hra", image: "/images/btn/health-rish-assessment.png"},
	{mod: "settings", image: "/images/btn/settings.png"},
	//{mod: "askDoctor", image: "/images/btn/settings.png"},
];

function doLogout(){
	Ti.App.Properties.removeProperty('u_id');
	Ti.App.Properties.removeProperty('name');
	Ti.App.Properties.removeProperty('clinic_id');
	Alloy.Globals.Navigator.navGroup.close();
	var win = Alloy.createController("auth/login").getView();
	win.open();
}

/**
 * Navigate by mod
 */
function navToMod(e){
	Alloy.Globals.Navigator.open(e.source.mod);
}

/*	
 	Render background image	
 * */
function render_background(){
	var home_background = Alloy.createCollection('background');
	var today = new Date();
	var hours = today.getHours();
	if(typeof (bg[0].img_path) != "undefined"){
		var bg = home_background.getData({time: hours}); 
	}
	//$.background.setBackgroundImage(bg[0].img_path);
}
/*
 * Render menu button
 * */
function render_menu_list(){
	//get screen width to calculate button width
	var pWidth = Titanium.Platform.displayCaps.platformWidth;
	var button_width = Math.floor((pWidth - 30) / 2);
	$.menu_scrollview.width = "100%";
	if (Ti.Platform.osname == 'ipad'){
		button_width = Math.floor((pWidth - 30) / 4);
		$.menu_scrollview.width = "80%";
	};

	for (var i=0; i < menu_info.length; i++) {
		console.log(menu_info[i].mod);
		var imageView_menu = $.UI.create("ImageView", {
			mod: menu_info[i].mod,
			width: button_width,
			left: 10,
			top: 10,
			image: menu_info[i].image,
		});
		
		imageView_menu.addEventListener("click", navToMod);
		$.menu_scrollview.add(imageView_menu);
	};
}

/*
 * render header user information 
 * */

function render_header_info(){
	var name = Ti.App.Properties.getString('name');
	
	var logoutBtn = Ti.UI.createButton({
		backgroundImage : "/images/btn/logout.png",
		width: 40,
		height: 40,
		left: 5,
		right: 5,
		zIndex: 20,
	});
	logoutBtn.addEventListener('click', function(){
		var dialog = Ti.UI.createAlertDialog({
			cancel: 1,
			buttonNames: ['Cancel','Confirm'],
			message: 'Would you like to logout?',
			title: 'Logout PLUX'
		});
		dialog.addEventListener('click', function(e){
			if (e.index === e.source.cancel){
			      //Do nothing
			}
			if (e.index === 1){
				doLogout();
			}
		}); 
		dialog.show(); 
	});
	 
	var title_view = $.UI.create("View", {
		width: "auto",
		height: Ti.UI.FILL,
	});
	var welcomeTitle = $.UI.create('Label',{
		text: "Welcome, "+name,
		classes :['welcome_text']
	});
	
	title_view.add(welcomeTitle);
	$.myInfo.add(logoutBtn);
	$.myInfo.add(title_view);
}

function refresh(){ 
	loading.start();
	render_header_info();
	render_menu_list();
	//render_background();
	loading.finish();
}

function init(){
	$.win.add(loading.getView());
	refresh();
}
init();

Ti.App.addEventListener('home:refresh',refresh);

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('home:refresh',refresh);
	$.destroy();
});