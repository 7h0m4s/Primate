//http://jsfiddle.net/fluidblue/6scX9/



function saveDB(){
	$.post("save",{},function(result){
		$('#alertChangesSaved').fadeIn("slow").delay(500).fadeOut("slow");
	  });
	
}

function loginDropDown(command) {
//This function is called if one of the buttons in the account's dropdown menu is clicked.
//Please tell Thomas is there is a better way of laying this code out without a million if statements.

if (command=="opnUrl"){


} else if (command=="cpyUsr") {



} else if (command=="cpyPswd") {



} else if (command=="cpyUrl") {



} else if (command=="view") {



} else if (command=="edit") {



} else if (command=="move") {



} else if (command=="delete") {



} else {
	alert("Error");

}



}