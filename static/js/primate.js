
/*  Password Primate Main Js
    The Primate js ensures all the front-end features are fully functional.
    Copyright (c) 2014, Asterix Solutions 
*/

var fadeTime = 1500;
var exception_msg = "Unexpected error";
var del_user_url = "get-user";
var edit_user_url = "get-user";
var notifi_fade_time = 500;
var post = "POST";
var save_DB_url = "save";

//use for testing only
var saveDB = function () {
    $.post(save_DB_url, {}, function (result) {
        $('#alertChangesSaved').fadeIn("slow").delay(notifi_fade_time).fadeOut("slow");
    });
}

/**
* This function is called if one of the buttons in the account's dropdown menu is clicked
* It handles copy of user password, url
* It allows to edit/delete user
*
* @return void
* @private
*/
var loginDropDown = function (id, command) {
    if (command == "opnUrl") {
    } else if (command == "cpyUsr") {
    } else if (command == "cpyPswd") {
    } else if (command == "cpyUrl") {
    } else if (command == "view") {
    } else if (command == "edit") {
        if ($('.del-user-chkbox').is(':checked')) {
            $('.del-user-chkbox').click();
        }
        $.post(edit_user_url, { uuid: id }, function (result) {
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
        var method = post;
        var url = del_user_url;
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
    } else {
        alert(exception_msg);
    }
}


/**
* This is a helper function that is used to be called by other functions.
* It is an ajax request used to post data to target url.
*
* @return void
* @private
*/
var posting = function (method, url, postData, successFun) {
    $.ajax({
        type: method,
        url: url,
        data: postData
    }).done(function (msg) {
        successFun();
        $("#alertChangesSaved").hide();
        $("#alertChangesSaved").html(msg).fadeIn(notifi_fade_time).delay(fadeTime).fadeOut(notifi_fade_time);
    })
      .fail(function (msg) {
          $('*').modal('hide');
          $("#alertMsg").hide();
          if (msg.length) {
              $("#alertMsg").html(msg).fadeIn(notifi_fade_time).delay(fadeTime).fadeOut(notifi_fade_time);
          } else {
              $("#alertMsg").html(exception_msg).fadeIn(notifi_fade_time).delay(fadeTime).fadeOut(notifi_fade_time);
          }
      });
};
/**
* This is a helper function that is used to be called by other functions.
* It is an ajax request used to post data to target url.
*
* @return void
* @private
*/
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
          $("#alertMsg").html("Unexpected error").fadeIn(notifi_fade_time).delay(fadeTime).fadeOut(notifi_fade_time);
      });
};

/**
* This is a helper function that is used to refresh pages with fade out jquery animation.
*
* @return void
* @private
*/
var refresh = function () {
    $("body").fadeOut(fadeTime, function () {
        window.location.reload();
    });
}

/**
* This is a helper function that is used to reset check box in modal
*
* @return void
* @private
*/
var ResetCheckbox = function () {
    $('.del-user-chkbox').prop("checked", false);
    var saveChangesBtn = $('.del-user-chkbox').closest("#delUserModal").find("button.saveChanges");
    $(saveChangesBtn).attr("disabled", "");
};

/**
* This is a helper function that is used to generate random password
*
* @return the random generated password
* @return type String
* @private
*/
var generatePassword = function (length, lower, upper, digits, hex, symbols, space, easy) {
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
            possible += 'abcdef';
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

$(function () {
    /**
    * Fade in animation
    */
    $("body").fadeIn(fadeTime);

    // Post request when a create group button clicks
    $("#form-create-group .saveChanges").click(function () {
        var method = post;
        var $createGroupForm = $("#form-create-group");
        var url = $createGroupForm.attr("target");
        var postData = $createGroupForm.serialize();
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
        var split = group.split(".", 1);
        if (split.length > 1) {
            $("#form-edit-group input[name='groupParent']").val(split[0]);
            $("#form-edit-group input[name='groupName']").val(split[1]);
        } else {
            $("#form-edit-group input[name='groupName']").val(split[0]);
        }
    });

    $("#form-create-user .saveChanges").click(function () {
        var method = post;
        var $createUserForm = $("#form-create-user");
        var url = $createUserForm.attr("target");
        var postData = $createUserForm.serialize();
        posting(method, url, postData, function () {
            refresh();
            $('#createUserModal').modal('hide');
        });
    });

    $('.passwordLink').click(function () {
        var id = $(this).attr('id');
        var method = post;
        var url = edit_user_url;
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
        var method = post;
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
        //temp using this to indicate the request is del or edit shouldnt be hard coding -->  seek for better solutions
        $(editGroup).find(".req").val("del");
        var method = post;
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
        var method = post;
        var url = $(editGroup).attr("target");
        var postData = $(editGroup).serialize();
        posting(method, url, postData, function () {
            refresh();
            $("#redditModal").modal('hide');
        });
    });

    $("#form-del-user .saveChanges").click(function () {
        var delUser = $("#form-del-user");
        var method = post;
        var url = $(delUser).attr("target");
        var postData = $(delUser).serialize();
        posting(method, url, postData, function () {
            $("#delUserModal").modal('hide');
            refresh();
        });
    });

    $(".import-btn").click(function (e) {
        e.preventDefault();
        $("#importDialog").click();
    });

    $("#importDialog").change(function () {
        var filename = $(this).val().replace(/.*(\/|\\)/, '');
        if (filename.length > 0) {
            $(".import-btn").html(filename);
            $("#import").val($(this).val());
        }
    });
});

//Initialise popovers
$('span').popover();
$('a').tooltip();

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

//It is a function used to make toggle effect to the panels
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

