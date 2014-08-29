//http://jsfiddle.net/fluidblue/6scX9/

var fadeTime = 1500;

function saveDB() {
    $.post("save", {}, function (result) {
        $('#alertChangesSaved').fadeIn("slow").delay(500).fadeOut("slow");
    });
}

function loginDropDown(id, command) {
    //This function is called if one of the buttons in the account's dropdown menu is clicked.
    //Please tell Thomas is there is a better way of laying this code out without a million if statements.

    if (command == "opnUrl") {


    } else if (command == "cpyUsr") {



    } else if (command == "cpyPswd") {



    } else if (command == "cpyUrl") {



    } else if (command == "view") {



    } else if (command == "edit") {
        if ($('.del-user-chkbox').is(':checked')) {
            $('.del-user-chkbox').click();
        }
        //$("#form-edit-user input[name='uuid']").val(id);
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
    } else if (command == "move") {



    } else if (command == "delete") {
        ResetCheckbox();
        var method = "POST";
        var url = "get-user";
        var postData = { uuid: id };
        req_posting(method, url, postData, function (result) {
            var userObj = jQuery.parseJSON(result);
            $("#form-del-user input[name='uuid']").val(userObj.uuid);
            $("#form-del-user input[name='usr']").val(userObj.usr);
            $("#form-del-user input[name='userTitle']").val(userObj.userTitle);
            $("#form-del-user input[name='userUrl']").val(userObj.userUrl);
            $("#form-del-user input[name='notes']").val(userObj.notes);
            $('#delUserModal').modal('show');
        });

        //$.post("get-user", { uuid: id }, function (result) {
        //    //alert("this is del func");
        //    /* 			var userObjTest = {};
        //                result = JSON.stringify(userObjTest); */
        //    var userObj = jQuery.parseJSON(result);
        //    $("#form-del-user input[name='uuid']").val(userObj.uuid);
        //    $("#form-del-user input[name='usr']").val(userObj.usr);
        //    $("#form-del-user input[name='userTitle']").val(userObj.userTitle);
        //    $("#form-del-user input[name='userUrl']").val(userObj.userUrl);
        //    $("#form-del-user input[name='notes']").val(userObj.notes);
        //    $('#delUserModal').modal('show');
        //});
    } else {
        alert("Error");

    }
}
var posting = function (method, url, postData, successFun) {
    $.ajax({
        type: method,
        url: url,
        data: postData
    }).done(function (msg) {
        successFun();
        $("#alertChangesSaved").hide();
        $("#alertChangesSaved").html(msg).fadeIn(500).delay(fadeTime).fadeOut(500);
        //.fadeOut("slow");
    })
      .fail(function (msg) {
          $('*').modal('hide');
          $("#alertMsg").hide();
          if (msg.length) {
              $("#alertMsg").html(msg).fadeIn(500).delay(fadeTime).fadeOut(500);
          } else {
              $("#alertMsg").html("Unexpected error").fadeIn(500).delay(fadeTime).fadeOut(500);
          }
      });
};

var req_posting = function (method, url, postData, successFun) {
    $.ajax({
        type: method,
        url: url,
        data: postData
    }).done(function (msg) {
        successFun(msg);
    })
      .fail(function (msg) {
          $('*').modal('hide');
          $("#alertMsg").hide();
          $("#alertMsg").html("Unexpected error").fadeIn(500).delay(fadeTime).fadeOut(500);
      });
};

function refresh() {
    window.location.reload();
    //$("body").fadeOut(fadeTime).load('/').fadeIn(fadeTime);
}

$(function () {
    $("#form-create-group .saveChanges").click(function () {
        //alert($("#form-create-group").serialize());
        //alert($("#form-create-group").attr("target"));
        var method = "POST";
        var url = $("#form-create-group").attr("target");
        var postData = $("#form-create-group").serialize();
        posting(method, url, postData, function () {
            refresh();
            $('#createGroupModal').modal('hide');
        });
    });

    $(".addUserButton").click(function () {
        var group = $(this).attr("group");
        $("#form-create-user input[name='group']").val(group);
    });

    $(".reeditGroup").click(function () {
        var group = $(this).attr("group");
        $("#form-edit-group input[name='group']").val(group);
		split = group.split(".",1);
		if (split.length > 1){
			$("#form-edit-group input[name='groupParent']").val(split[0]);
			$("#form-edit-group input[name='groupName']").val(split[1]);
		}else{
			$("#form-edit-group input[name='groupName']").val(split[0]);
		}
    });

    $("#form-create-user .saveChanges").click(function () {
        //console.log($("#form-create-group").serialize());
        //console.log($("#form-create-group").attr("target"));
        //alert(this.attr("group"));
        var method = "POST";
        var url = $("#form-create-user").attr("target");
        var postData = $("#form-create-user").serialize();
        posting(method, url, postData, function () {
            refresh();
            $('#createUserModal').modal('hide');
        });
    });

    $('.passwordLink').click(function () {
        var id = $(this).attr('id');
        var method = "POST";
        var url = "get-user";
        var postData = { uuid: id };
        req_posting(method, url, postData, function (result) {
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
            refresh();
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

    $('.del-group-chkbox').click(function () {
        var isCheck = $(this).is(':checked');
        var deleteGroupButton = $("#deleteGroupButton");
        if (isCheck) {
            $(deleteGroupButton).removeAttr("disabled");
        } else {
            $(deleteGroupButton).attr("disabled", "");
        }
    });


    $("#deleteGroupButton").on("click",function () {
        var editGroup = $("#form-edit-group");

        //temp using this to indicate the request is del or edit   shouldnt be hard coding -->  seek for better solutions
        $(editGroup).find(".req").val("del");
        var method = "POST";
        //var url = $(editGroup).attr("target"); //delete and edit targets are different
		 var url = "/delete-group";
        var postData = $(editGroup).serialize();
        posting(method, url, postData, function () {
            $('#redditModal').modal('hide');
            refresh();
        });
    });

    $("#form-edit-group .saveChanges").click(function () {
        var editGroup = $("#form-edit-group");
        $(editGroup).find(".req").val("edit");
        var method = "POST";
        var url = $(editGroup).attr("target");
        var postData = $(editGroup).serialize();
        posting(method, url, postData, function () {
            refresh();
            $("#redditModal").modal('hide');
        });
    });


    $("#form-del-user .saveChanges").click(function () {
        var delUser = $("#form-del-user");
        var method = "POST";
        var url = $(delUser).attr("target");
        var postData = $(delUser).serialize();
        posting(method, url, postData, function () {
            $("#delUserModal").modal('hide');
            refresh();
        });
    });
});

var ResetCheckbox = function () {
    $('.del-user-chkbox').prop("checked", false);
    var saveChangesBtn = $('.del-user-chkbox').closest("#delUserModal").find("button.saveChanges");
    $(saveChangesBtn).attr("disabled", "");
};


/////////////////////////////////////////////


//Initialise popovers
$('span').popover();
$('a').tooltip();

//$('.saveChanges').click(function () {
//    $('#alertChangesSaved').fadeIn("slow").delay(500).fadeOut("slow");
//});

////todo test
////$('.passwordLink').click(function () {
////    $('#alertPasswordCopied').fadeIn("slow").delay(500).fadeOut("slow");
////    id = $(this).attr('id');
////    $.post("getRecordData", { uuid: id }, function (result) {
////        alert(result);
////    });
////});

//$('#deleteGroupButton').click(function () {
//    $('#alertDeleted').fadeIn("slow").delay(500).fadeOut("slow");
//    $('#redditPanel').fadeOut("slow");
//});


$('#listGridToggleButton').click(function () {
    if ($(this).children('span').hasClass('glyphicon-align-left') == true) {
        $(this).children('span').removeClass('glyphicon-align-left').addClass('glyphicon-th-large');
        $('div.writeMain > div').removeClass('col-md-4').addClass('col-md-12');
    }
    else {
        $(this).children('span').removeClass('glyphicon-th-large').addClass('glyphicon-align-left');
        $('div.writeMain > div').removeClass('col-md-4').addClass('col-md-4');
    }
});

$(function () {
    $("#writeMain, #writeOther, #readMain, #readOther, #unassignedMain, #unassignedOther").sortable({
        connectWith: ".connectedUserPermissions"
    }).disableSelection();
});
$(function () {
    $(".writeMain").sortable({
        connectWith: ".writeMain",
        placeholder: 'col-xs-4',
        helper: 'clone',
        appendTo: 'body',
        forcePlaceholderSize: true,
        start: function (event, ui) {
            $('.row > div.col-md-4:visible:first').addClass('real-first-child');
        },
        stop: function (event, ui) {
            $('.row > div.real-first-child').removeClass('real-first-child');
        },
        change: function (event, ui) {
            $('.row > div.real-first-child').removeClass('real-first-child');
            $('.row > div.col-md-4:visible:first').addClass('real-first-child');
        }
    });
});


$.fn.bootstrapSwitch.defaults.size = 'small';
$("[name='autoLogoutCheckbox']").bootstrapSwitch();
$("[name='autoLogoutCheckbox']").on('switchChange.bootstrapSwitch', function () {
    $('#autoLogoutForm').toggle();
});
$("[name='clearClipboardCheckbox']").bootstrapSwitch();
$("[name='clearClipboardCheckbox']").on('switchChange.bootstrapSwitch', function () {
    $('#clearClipboardForm').toggle();
});
$("[name='remindersCheckbox']").bootstrapSwitch();
$("[name='remindersCheckbox']").on('switchChange.bootstrapSwitch', function () {
    $('#remindersForm').toggle();
});


$('#addUser').hide();
//$('#addUserButton').on("click", function () {
//    $('#addUser').toggle();
//});

$('#editGroup').hide();
$('#editGroupButton').on("click", function () {
    $('#editGroup').toggle();
});

$('#editUser').hide();
$('#editUserButton').on("click", function () {
    $('#editUser').toggle();
});

$(".hideClass").hide();

$('.generatorSettings').hide();
$('.generatorSettingsButton').on("click", function () {
    $('.generatorSettings').toggle();
});

$('.togglePassword').on("click", function () {
    if ($($(this).parent().parent().children()[1]).attr('type') == 'text') {
        $($(this).children()[0]).removeClass("glyphicon-eye-close").addClass("glyphicon-eye-open");
        $($(this).parent().parent().children()[1]).removeAttr('type');
        $($(this).parent().parent().children()[1]).prop('type', 'password');
    }
    else {
        $($(this).children()[0]).removeClass("glyphicon-eye-open").addClass("glyphicon-eye-close");
        $($(this).parent().parent().children()[1]).removeAttr('type');
        $($(this).parent().parent().children()[1]).prop('type', 'text');
    }
});

$('.toggleCopy').on("click", function () {
    if ($(this).hasClass("glyphicon-user")) {
        $(this).removeClass("glyphicon-user").addClass("glyphicon-qrcode");
    }
    else {
        $(this).removeClass("glyphicon-qrcode").addClass("glyphicon-user");
    }
});

$('.generatePasswordButton').on("click", function () {
    $($(this).parent().parent().children()[1]).val(generatePassword(16, true, true, true, true, true, true, false));
});

$('#lightThemeButton').on("click", function () {
    $('#darkThemeButton').removeClass('active');
    $(this).addClass('active');
    $('link[href="css/bootstrap.dark.min.css"]').attr('href', 'css/bootstrap.min.css');
});
$('#darkThemeButton').on("click", function () {
    $('#lightThemeButton').removeClass('active');
    $(this).addClass('active');
    $('link[href="css/bootstrap.min.css"]').attr('href', 'css/bootstrap.dark.min.css');
});

function generatePassword(length, lower, upper, digits, hex, symbols, space, easy) {
    var text = "";
    var possible = "";

    if (lower == true) {
        possible += "abcdefghijklmnopqrstuvwxyz";
    }

    if (upper == true) {
        possible += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    if (digits == true) {
        possible += "0123456789";
    }

    if (hex == true) {
        if (lower == false) {
            possible += 'abcdef'
        }
        if (digits == false) {
            possible += '0123456789';
        }
    }

    if (symbols == true) {
        possible += "!\"#$%&'()*+,-./\\:;<=>?@[]^_`{}~";
    }

    if (space == true) {
        possible += " ";
    }

    if (easy == true) {
        possible = possible.replace("0", "");
        possible = possible.replace("o", "");
        possible = possible.replace("O", "");

        possible = possible.replace("1", "");
        possible = possible.replace("i", "");
        possible = possible.replace("I", "");
        possible = possible.replace("l", "");
        possible = possible.replace("|", "");
    }

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

