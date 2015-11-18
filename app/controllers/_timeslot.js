var args = arguments[0] || {};
var specialty = args.specialty;
var clinicId = args.clinic_id;
var listing = [];
var selected_date = args.selected_date || new Date();
var lastday = selected_date;
var days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
var u_id = Ti.App.Properties.getString('u_id') || 0;
var indicator_color = ["#ffffff", '#fccd03', '#CE1D1C', '#afdb00', '#3f99f9', 'black'];
var font_color = ["#000000", '#ffffff', "#ffffff", '#ffffff', '#ffffff', '#ffffff'];
//generate date function

Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};

function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
		while (currentDate <= stopDate) {
			dateArray.push(currentDate);
			currentDate = currentDate.addDays(1);
		}
	lastday = currentDate;
	return dateArray;
}

function convertMinuteToHour(minutes){
	var date = new Date(1970,0,1);
    date.setMinutes(minutes);
    return ('0' + date.getHours()).slice(-2)+":"+('0' + date.getMinutes()).slice(-2);
}

function render_date_bar(){
	if(args.multiple_select){
		$.date_bar.height = 0;
		return;
	}
	$.date_bar.height = 80;
	var dateArray = getDates(lastday, (lastday).addDays(10));
	for (i = 0; i < dateArray.length; i ++ ) {
		var active_view = (selected_date == dateArray[i])?"active_view":"";
		var active_label = (selected_date == dateArray[i])?"active_label":"";
	    var day = days[dateArray[i].getDay()];
	    var month = months[dateArray[i].getMonth()];
	    var date = dateArray[i].getDate();
	    var view_date_box = $.UI.create("View",{
	    	width: 80,
	    	height: 80,
	    	view_element: "view_date_box",
	    	date_s: dateArray[i],
	    	classes:['gap', active_view]
	    });
	    var label_day_month = $.UI.create("Label", {
	    	classes: ['wsize', 'hsize', 'h6', active_label],
	    	text: day+", "+month,
	    	top: 10
	    });
	    var label_date = $.UI.create("Label",{
	    	text: date,
	    	classes: ['wsize', 'hsize', 'h5', 'bold', active_label]
	    });
	    view_date_box.add(label_day_month);
	    view_date_box.add(label_date);
	    $.date_bar.add(view_date_box);
	    view_date_box.addEventListener("click", changeDate);
	}
}

function render_available_timeslot(){
	var pw = Ti.Platform.displayCaps.platformWidth;
	var ldf = Ti.Platform.displayCaps.logicalDensityFactor;
	var pwidth = parseInt(pw / (ldf || 1), 10);
	if(OS_IOS){
		pwidth = Ti.Platform.displayCaps.platformWidth;
	}
	var cell_width = Math.floor((pwidth - 22) / 3);
	
	$.inner_box.width = pwidth - 18;
	
	$.timeslot.removeAllChildren();
	
	var workingHourArray = new Array();
	var working_hour_begin = parseInt(Ti.App.Properties.getString('working_hour_begin')) || 480; //8:00 am
	var working_hour_end = parseInt(Ti.App.Properties.getString('working_hour_end')) || 1320; //10:00 pm
	var timeblock = parseInt(Ti.App.Properties.getString('timeblock')) || 30;
	var appointmentModel = Alloy.createCollection('appointment');  
	var booked_time = new Array();
	
	/*
	 generate timeslot by working hour begin / end
	 * */
	while(working_hour_begin+timeblock < working_hour_end){
		var time_key = Math.floor(working_hour_begin / timeblock);
		workingHourArray[time_key] = {status: 0, remark: "", minute: working_hour_begin, duration: timeblock};
		working_hour_begin = working_hour_begin + timeblock;
	}
	
	/*
	 get booked timeblock by u_id and clinic from local DB
	 * */
	
	var start_date = selected_date.getFullYear()+"-"+(parseInt(selected_date.getMonth())+1)+"-"+selected_date.getDate()+" 00:00:00";
	var end_date = selected_date.getFullYear()+"-"+(parseInt(selected_date.getMonth())+1)+"-"+selected_date.getDate()+" 23:59:59";
	var appointmentList = appointmentModel.getAppointmentList({u_id: u_id, clinicId: clinicId, specialty: specialty, start_date: start_date, end_date:end_date});
	console.log("appointmentList");
	console.log(appointmentList);
	/*
	 generate booked timeslot from appointment list
	 * */
	for (var i=0; i < appointmentList.length; i++) {
	  var datetime = appointmentList[i].start_date;
	  var timeStamp = datetime.split(" ");
	  var time = timeStamp[1].split(":"); 
	  var booking_min = parseInt(time[0]) * 60 + parseInt(time[1]);
	  var time_start_key = Math.floor(booking_min / timeblock);
	  var time_end_key = Math.floor((booking_min+parseInt(appointmentList[i].duration)) / timeblock);
	  for(;time_end_key > time_start_key;  time_start_key++){
	  	console.log(time_start_key+"key");
	  	booked_time[time_start_key] = ({status: appointmentList[i].status, remark: appointmentList[i].remark, patient_name: appointmentList[i].patient_name, patient_id: u_id,  duration: appointmentList[i].duration, appointment_id: appointmentList[i].id, minute: booking_min});
	  }
	};
	
	/*
	 replace booked slot at workingHourArray
	 * */
	console.log(booked_time);
	booked_time.forEach( function ( val, i ) {
		workingHourArray[i] = val;
	});
	
	//workingHourArray = _.omit(workingHourArray, booked_time);
	console.log("workingHourArray");
	console.log(workingHourArray);
	/*
	 render workingHourArray 
	 * */
	for(key in workingHourArray){
		
		var patient_id = workingHourArray[key].patient_id || "";
		console.log('a '+ workingHourArray[key].duration);
		var view_time_box = $.UI.create("View", {
			view_time_box: 1,
			width: cell_width,
			remark: workingHourArray[key].remark,
			status: workingHourArray[key].status,
			selected_date: selected_date,
			duration: workingHourArray[key].duration,
			patient_name: workingHourArray[key].patient_name,
			patient_id: patient_id,
			appointment_id: workingHourArray[key].appointment_id,
			backgroundColor: indicator_color[workingHourArray[key].status],
			date_s:  selected_date.getFullYear()+"-"+(parseInt(selected_date.getMonth())+1)+"-"+selected_date.getDate()+" "+convertMinuteToHour(workingHourArray[key].minute),
			classes: ["hsize", 'time_gap']
		});
	    
		var label_time = $.UI.create("Label",{
			textAlign: "center",
			duration: workingHourArray[key].duration,
			color: font_color[workingHourArray[key].status],
			text: convertMinuteToHour(workingHourArray[key].minute),
			classes: ['wfill', 'hsize', 'h5', 'padding']
		});
		
		view_time_box.add(label_time);
		$.timeslot.add(view_time_box);
		if(args.multiple_select){
			if(!workingHourArray[key].status){
				view_time_box.addEventListener("click", args.date_click);
			}
		}else if(workingHourArray[key].status){
			view_time_box.addEventListener("click", args.date_click);
		}
	}
}

function changeDate(e){
	var sdate = parent({name: "date_s"}, e.source);
	var childrens = $.date_bar.getChildren();
	
	for (var i=0; i < childrens.length; i++) {
	  //$.removeClass(childrens[i], "active_view");
	  childrens[i].backgroundColor = "#FFFFFF";
	 	var child_child = childrens[i].getChildren();
	 	for (var j=0; j < child_child.length; j++) {
	 		child_child[j].color = "#000000";
	 		//$.removeClass(child_child[j], "active_label");
		 };
	};
	
	var select_view = parent({name: "view_element", value: "view_date_box"}, e.source);
	select_view.backgroundColor = "#CE1D1C";
	//$.addClass(select_view, "active_view");
	var active_children = select_view.getChildren();
	for (var k=0; k < active_children.length; k++) {
		active_children[k].color = "#FFFFFF";
 		//$.addClass(active_children[k], "active_label");
	 };
	selected_date = sdate;
	render_available_timeslot();
}

function refresh(){
	//listing = panelListModel.getPanelListTest();
	render_date_bar();
	render_available_timeslot();
}

function init(){
	refresh();
}

init();
