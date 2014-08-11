/*! Password Primate Testing
 *  Written by:
 *  - Rahadian Adinegoro     43303744
 *  - Kevin Anggara          43301281
 *  - Eleri Edwards          42350723
 *  - Laurence McLean        42373414
 *  - Jacky Tang             41811487
 *  - Ivan Yudo              43302194
 
 */

function testMain() {
	$("#testresult").append("Starting tests...<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Checking Open file Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(readFile("test_files/blankfile.txt"),"","Blank file");
		success+=check(readFile("test_files/newline.txt"),"\n","Blank except newline");
		success+=check(readFile("test_files/alphanum1.txt"),"000","Small numeric file");
		success+=check(readFile("test_files/alphanum2.txt"),"abc\n123","Small alphanumeric file");
		success+=check(readFile("test_files/alphanum3.txt"),"abcdefg\nhijklmnop","Small alphanumeric file");
		success+=check(readFile("test_files/symbols.txt"),"a@#$5%3829#!~`\n\t8*","Symbol file");
	} else {
		total += 6;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Open file functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Checking Encryption and Decryption Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","Encrypt blank database");
		success+=check(" ","","Encrypt and decrypt give plaintext 1");
		success+=check(" ","","Encrypt and decrypt give plaintext 2");
		success+=check(" ","","Encrypt and decrypt give plaintext 3");
		success+=check(" ","","Encrypt and decrypt give plaintext 4");
		success+=check(" ","","Decrypt blank database");
	} else {
		total += 6;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Encryption and Decryption functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Checking Login Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","Multi-Factor Authentication Blank Value");
		success+=check(" ","","Multi-Factor Authentication valid value");
		success+=check(" ","","Login with correct authentication 1");
		success+=check(" ","","Login with correct authentication 2");
		success+=check(" ","","Login with correct authentication 3");
		success+=check(" ","","Login with correct authentication 4");
		success+=check(" ","","Login with bad authentication 1");
		success+=check(" ","","Login with bad authentication 2");
		success+=check(" ","","Login with bad authentication 3");
		success+=check(" ","","Login with bad authentication 4");
		success+=check(" ","","Login with bad authentication 5");
	} else {
		total += 11;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Login functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Checking Load/Save Database Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","Load Blank Database");
		success+=check(" ","","Load database with one password with all values blank");
		success+=check(" ","","Load database with two groups, two passwords, all values blank");
		success+=check(" ","","Load database with one group, five passwords, all values blank");
		success+=check(" ","","Load database with fifty groups, four hundred passwords, all values blank");
		success+=check(" ","","Load database with one password");
		success+=check(" ","","Load database with five hundred passwords");
		success+=check(" ","","Save blank database");
		success+=check(" ","","Save database with one password all values blank");
		success+=check(" ","","Save database with five hundred passwords");
		success+=check(" ","","Save database with one group, five passwords, all values blank");
		success+=check(" ","","Save database with fifty groups, four hundred passwords, all values blank");
	} else {
		total += 12;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Load/Save Database functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Checking Get/Set Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","Get blank username");
		success+=check(" ","","Get blank password");
		success+=check(" ","","Get blank group name");
		success+=check(" ","","Get blank group url");
		success+=check(" ","Username","Get username 1");
		success+=check(" ","SomeOtherUsename %","Get username 2");
		success+=check(" ","pass","Get password 2");
		success+=check(" ","1@3$5^7*i","Get password 2");
		success+=check(" ","Reddit","Get group name");
		success+=check(" ","fakeaddress.com","Get group url");
		success+=check(" ","","Set blank password");
		success+=check(" ","1234%^&*hjkl","Set password 1");
		success+=check(" ","aaaaAAAAaaaa","Set password 2");
		success+=check(" ","notarealpasswordthisoneisgoingtobereallylongandridiculous","Set password 3");
		success+=check(" ","ThisISMyUsername","Set username 1");
		success+=check(" ","Another Username","Set username 2");
		success+=check(" ","FacebookGroup","Set group name");
		success+=check(" ","facebook.com","Set group url");
	} else {
		total += 18;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Get/Set functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Add Password Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","Create a new password in a group 1");
		success+=check(" ","","Create a new password in a group 2");
		success+=check(" ","","Create a new password in a group 3");
		success+=check(" ","","Create a new password in a group 4");
		success+=check(" ","","Create a new password in a group 5");
		success+=check(" ","","Create a new password in a group 6");
		success+=check(" ","","Create a new password in a group 7");
		success+=check(" ","","Create a new password in a group 8");
		success+=check(" ","","Create a new password in a group 9");
		success+=check(" ","","Create a new password in a group 10");
	} else {
		total += 10;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Load/Save Database functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	// Copypaste
	total = 0;
	success = 0;
	$("#testresult").append("Permission Functions...<br />");
	if(typeof readFile=="function") {
		success+=check(" ","","User has all permissions 1");
		success+=check(" ","","User has all permissions 2");
		success+=check(" ","","User has all permissions 3");
		success+=check(" ","","User has all permissions 4");
		success+=check(" ","","User has all permissions 5");
		success+=check(" ","","User has no permissions 1");
		success+=check(" ","","User has no permissions 2");
		success+=check(" ","","User has no permissions 3");
		success+=check(" ","","User has no permissions 4");
		success+=check(" ","","User has no permissions 5");
		success+=check(" ","","User has some permissions (allowed) 1");
		success+=check(" ","","User has some permissions (allowed) 2");
		success+=check(" ","","User has some permissions (allowed) 3");
		success+=check(" ","","User has some permissions (allowed) 4");
		success+=check(" ","","User has some permissions (allowed) 5");
		success+=check(" ","","User has some permissions (not allowed) 1");
		success+=check(" ","","User has some permissions (not allowed) 2");
		success+=check(" ","","User has some permissions (not allowed) 3");
		success+=check(" ","","User has some permissions (not allowed) 4");
		success+=check(" ","","User has some permissions (not allowed) 5");
	} else {
		total += 20;
		$("#testresult").append("readFile(..) not defined.<br />");
	}
	$("#testresult").append("Load/Save Database functions finished. " + success + "/" + total + " passed.<br /><br />");
	
	
	$("#testresult").append("<br />Finished tests.");
}

/* Return 1 on success, 0 on failure. Output on failure. */
function check(check, expected, description) {
	total++;
	if(check==expected) {
	    return 1;
	} else {
		$("#testresult").append(description + " <b>failed</b>. Expected: <span style='color:blue'>" + expected + "</span>. Recieved: <span style='color:red'>" + check + "</span>.<br />");
		return 0;
	}
}