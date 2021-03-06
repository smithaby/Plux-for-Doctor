var counter = 0;

var loadingList = [
	{type: "api"},
	//{type: "model", model: "items", func: "calculate_distance"}
];
/**
 * function to start the loading animation
 */
function start(){
	console.log('start');
	$.logo.start();
	next_loading();
};


function next_loading(){
	console.log(counter+'next'+loadingList.length);
	if(counter >= loadingList.length){
		console.log("app:loadingViewFinish");
		Ti.App.fireEvent('app:loadingViewFinish');
		finish();
		return false;
	}
	var loader = loadingList[counter];
	counter++;
	var type = loader.type;
	if(type == "api"){
		API.loadAPIBySequence();
	}else if(type == "model"){
		console.log("geo test : "+counter+" "+type);
		var model = Alloy.createCollection(loader.model);
		eval("model."+loader.func+"()");
	}
}

function navToHomepage(){
	var index_home = Alloy.createController("index_home");
}

/*
 * exposed function to finish the loading animation. Animates the rocket off the screen.
 */
var finish = function() {
	navToHomepage();
	$.win.close();
	loadingView = null;
};

function init(){
	start();
}

init();
//load API loadAPIBySequence

function update_loading_text(e){
	$.loading_text.text = e.text;
}

Ti.App.addEventListener('app:update_loading_text', update_loading_text);
Ti.App.addEventListener('app:next_loading', next_loading);

$.win.addEventListener("close", function(e){
	console.log("close loader");
	Ti.App.removeEventListener('app:update_loading_text', update_loading_text);
	Ti.App.removeEventListener('app:next_loading', next_loading);
});
