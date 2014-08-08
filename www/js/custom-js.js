//-------------------------shows item as being clicked
var isTouchSupported = 'ontouchstart' in window;
var startEvent = isTouchSupported ? 'touchstart' : 'mousedown';
var moveEvent = isTouchSupported ? 'touchmove' : 'mousemove';
var endEvent = isTouchSupported ? 'touchend' : 'mouseup';
var leaveEvent = isTouchSupported ? 'touchleave' : 'mouseleave';
var endEvents = endEvent+" "+leaveEvent;
//-------------------------shows item as being clicked



//----------------------------------------this is blurring selection
$(".icon-show-as-clicked-blur").on(startEvent, function(){
    $(this).addClass("jicon-is-selected-blur"); 
});

$(".icon-show-as-clicked-blur").on( endEvents , function(){
    var element = this;
    setTimeout(function () {
        $(element).removeClass("jicon-is-selected-blur");  
        $(element).addClass("jicon-is-deselected-blur");          
    }, 400);
});
//----------------------------------------this is blurring selection


//----------------------------this is non blurring selection
$(".button-show-as-clicked").on(startEvent, function(){
    $(this).addClass("jicon-is-selected"); 
});

$(".button-show-as-clicked").on( endEvents , function(){
    var element = this;
    setTimeout(function () {
        $(element).removeClass("jicon-is-selected");           
    }, 400);
});
//----------------------------this is non blurring selection

//----------------for accessing local storage
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
//----------------for accessing local storage

//--------------------set body height

function setBodyHeight() {
    //this is needed because it determines the scroll area
    //var footerDistanceFromTop = $("#body-footer").offset().top;
    $("#body-content").height($("#body-footer").offset().top-90);
}

//--------------------set body height

//-------------------------------------does stuff after view model is loaded
function doThisStuffAfterViewIsLoaded() {
    setBodyHeight();
}

function checkIfViewModelIsLoaded() {
    if(typeof vm !== 'undefined') {
        clearInterval(refreshIntervalId);
        doThisStuffAfterViewIsLoaded();
    }
}

var refreshIntervalId = setInterval(checkIfViewModelIsLoaded, 100);
//-------------------------------------does stuff after view model is loaded

//-------------------------------------does stuff after orientation change

$( window ).on( "resize", function( event ) {
    
    // updates body when ever user rotates device
    $(".arrow").hide();
    setBodyHeight();
    vm.updateCardUi();
    $(".arrow").show();

});
//-------------------------------------does stuff after orientation change




