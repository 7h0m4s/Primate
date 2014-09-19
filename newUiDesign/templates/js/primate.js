var calFrameHeight = function () {
    var headerDimensions = $('header.bg-blue').height();
    var bordertopbottom = 4;
    $('#content-detail').height($(window).height() - headerDimensions - bordertopbottom);
}
$(function () {
    calFrameHeight();
    setTimeout(function () { $('.example').animate({ margin: "0", opacity: '1', }, 600); $("#loader").hide(); }, 2000);
    $('#main').split({ orientation: 'vertical', limit: 220, position: '20%', });
    $('.side-content').split({ orientation: 'vertical', limit: 220, position: '40%' });
});
$(window).resize(function () {
    calFrameHeight();
}).load(function () {
    calFrameHeight();
});

