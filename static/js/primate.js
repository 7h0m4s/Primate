//http://jsfiddle.net/fluidblue/6scX9/



function saveDB(){
	$.post("save",{},function(result){
		$('#alertChangesSaved').fadeIn("slow").delay(500).fadeOut("slow");
	  });
	
}

function loginDropDown(command) {
//This function is called if one of the buttons in the account's dropdown menu is clicked.
//Please tell Thomas is there is a better way of laying this code out without a million if statements.

    if (command == "opnUrl") {


    } else if (command == "cpyUsr") {



    } else if (command == "cpyPswd") {



    } else if (command == "cpyUrl") {



    } else if (command == "view") {



    } else if (command == "edit") {
        $(obj).closest("div.row").find('.passwordLink').click();
    } else if (command == "move") {



    } else if (command == "delete") {
        
        /* var userObjTest = {};
        userObjTest.uuid = "789798-87879";
        userObjTest.usr = "jf123456";
        userObjTest.userTitle = "asdfghjk";
        userObjTest.userUrl = "www.google.com";
        userObjTest.notes = "Test test!"; */

        var id = $(obj).closest("div.row").find('.passwordLink').attr("id");
        alert("this is del func --> before post");
        $.post("get-user", { uuid: id }, function (result) {
            alert("this is del func");
            result = JSON.stringify(userObjTest);
            var userObj = jQuery.parseJSON(result);
            $("#form-del-user input[name='uuid']").val(userObj.uuid);
            $("#form-del-user input[name='usr']").val(userObj.usr);
            $("#form-del-user input[name='userTitle']").val(userObj.userTitle);
            $("#form-del-user input[name='userUrl']").val(userObj.userUrl);
            $("#form-del-user input[name='notes']").val(userObj.notes);
            $('#delUserModal').modal('show');
        });
    } else {
        alert("Error");

    }
}
var posting = function (method, url, postData, successFun) {
    $.ajax({
        type: method,
        url: url,
        data: postData
    }).done(function () {
        successFun();
        //alert("success");
    })
      .fail(function () {
          //to be removed successFun(); test only
          successFun();
          alert("Save failed. Please check your Internet connection.");
      });
};

function refresh() {
	$("#gridview").load("/refresh");
	//alert("Refreshed!");

}

$(function () {


    $("#form-create-group .saveChanges").click(function () {
        //alert($("#form-create-group").serialize());
        //alert($("#form-create-group").attr("target"));
        var method = "POST";
        var url = $("#form-create-group").attr("target");
        var postData = $("#form-create-group").serialize();
        posting(method, url, postData, function () {
			refresh()
            $('#createGroupModal').modal('hide');
        });
    });
	
	$(".addUserButton").click(function(){
		//alert("butts");
		var group = $(this).attr("group");
		//alert(group);
		$("#form-create-user input[name='group']").val(group);
		
	});
	
    $("#form-create-user .saveChanges").click(function () {
        //console.log($("#form-create-group").serialize());
        //console.log($("#form-create-group").attr("target"));
		//alert(this.attr("group"));
        var method = "POST";
        var url = $("#form-create-user").attr("target");
        var postData = $("#form-create-user").serialize();
        posting(method, url, postData, function () {
			refresh()
            $('#createUserModal').modal('hide');
        });
    });

    $('.passwordLink').click(function () {
        //var userObjTest = {};
        /* userObjTest.uuid = "789798-87879";
        userObjTest.usr = "jf123456";
        userObjTest.userTitle = "asdfghjk";
        userObjTest.userUrl = "www.google.com";
        userObjTest.notes = "Test test!"; */

        var id = $(this).attr('id');

        $.post("get-user", { uuid: id }, function (result) {
            //result = JSON.stringify(userObjTest);
            var userObj = jQuery.parseJSON(result);
            $("#form-edit-user input[name='uuid']").val(userObj.uuid);
            $("#form-edit-user input[name='usr']").val(userObj.usr);
            $("#form-edit-user input[name='userTitle']").val(userObj.userTitle);
            $("#form-edit-user input[name='userUrl']").val(userObj.userUrl);
            $("#form-edit-user input[name='notes']").val(userObj.notes);
            $('#editUserModal').modal('show');
        });
    });


    $("#form-edit-user .saveChanges").click(function () {
        var editUser = $("#form-edit-user");
        var method = "POST";
        var url = $(editUser).attr("target");
        var postData = $(editUser).serialize();
        posting(method, url, postData, function () {
			refresh()
            $("#editUserModal").modal('hide');
        });
    });

    $('.del-user-chkbox').click(function () {
        var isCheck = $(this).is(':checked');
        var saveChangesBtn = $(this).closest("#delUserModal").find("button.saveChanges");
        if (isCheck) {
            $(saveChangesBtn).removeAttr("disabled");
        } else {
            $(saveChangesBtn).attr("disabled", "");
        }
    });

    $("#form-del-user .saveChanges").click(function () {
        var delUser = $("#form-del-user");
        var method = "POST";
        var url = $(delUser).attr("target");
        var postData = $(delUser).serialize();
        posting(method, url, postData, function () {
			refresh()
            $("#delUserModal").modal('hide');
        });
    });
});
