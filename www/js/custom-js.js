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
    $("#body-content").height($("#body-footer").offset().top + $("#body-footer").height() - 50);
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
    vm.flashCards.updateCardUi();
    $(".arrow").show();

});
//-------------------------------------does stuff after orientation change


//-------------so code can tell the difference between user clicking and scrolling on card
$('.scroll-wrapper, #touch-layer')
   .data('shouldFollowDistance', false)
   .on('mousedown', function() {


        if (!vm.flashCards.hideCheckers()) {
            $(this).data("couldBeClickOnCard", true );
            $(this).data("startx", arguments[0].pageX );
            $(this).data("starty", arguments[0].pageY );
            $(this).data('shouldFollowDistance',true);
        } else {
            $(this).data("couldBeClickOnCard", false );
        }

        //hides footer if click is on input and tells app, data is updatable
        if(arguments[0].target.tagName === "INPUT") {
            $("#body-footer").addClass("isDisabled");
            vm.flashCards.lastActiveElement = "INPUT";
            vm.flashCards.shouldUpdateCardData = true;
        }

    })
   .on('mousemove', function() {
        //here so user can scroll without switching sides

        if( $(this).data("shouldFollowDistance") === true ) {
            if($(this).data("startx") !== undefined && $(this).data("starty") !== undefined) {
                var x           = Math.abs(arguments[0].pageX - ($(this).data("startx")));
                var y           = Math.abs(arguments[0].pageY - ($(this).data("starty")));
                var distance    = Math.sqrt( x*x + y*y );

                if(distance > 50) {
                    /*
                        if the distance is too large, this is no longer
                    */
                    $(this).data('shouldFollowDistance',false);
                    $(this).data("couldBeClickOnCard", false );
                }
            }
        }


    })
   .on('click', function() {
        if(!vm.flashCards.hideCheckers() && $(this).data("couldBeClickOnCard") ) {
            //toogle side (maybe) b/c user is clicking on card, not scrolling

            if (vm.flashCards.lastActiveElement === "INPUT" && arguments[0].target.tagName !== "INPUT" ) {
                //if the input is focused and click is not on input, then only remove the focus (and don't toggle side)
                $('input').blur();
                vm.flashCards.lastActiveElement= arguments[0].target.tagName;
            } else if (arguments[0].target.tagName !== "INPUT" && arguments[0].target.classList[0]!=="disable-touch-click") {
                //if this click is not on an input, then toggle side
                vm.flashCards.toggleSide();
            }
        }
    });
//-------------so code can tell the difference between user clicking and scrolling on card

//----------------bring back footer for all cases except for inputs
$("input").on("focus", function(){
    $("#body-footer").addClass("isDisabled");
});

$("*").on("click", function(){
    if (arguments[0].target.tagName !== "INPUT") {
        $("#body-footer").removeClass("isDisabled");

        if(vm.flashCards.shouldUpdateCardData) {
            vm.flashCards.saveCard();
        }
    }
});
//----------------bring back footer for all cases except for inputs


//-----------------------removing an item from array
function removeItemFromArray(array, index_of_item_to_remove) {
    var new_array = [];
    var array_length = array.length;

    for (var index=0; index<array_length; index++) {
      if (index != index_of_item_to_remove) {
        new_array.push(array[index]);
        }
    }
    return new_array;
}
//-----------------------removing an item from array

//--------------------------so user can delete a card list

$('.scroller').on("mousedown", ".deletable", function () {
	myScroll.enable();
    //-----------------------------initialization
    $(window).data("startx", arguments[0].pageX );
    $(window).data("starty", arguments[0].pageY );
    $(window).data('isARealMouseDown',true);
    //-----------------------------initialization

	vm.indexOfCardListInSummaryToDelete(this.getAttribute("data-list_summary_id"));
	vm.indexOfCardListInLocalStorageToDelete(this.getAttribute("data-local_storage_id"));
	 
	window.downTimer = setTimeout(function() {

	if ($(window).data('isARealMouseDown') === true) {
		/*
		 * 	when here, user held down scroller for
		 *	some period of time without scrolling
		 */
		 vm.showModals();
	}

	}, 2000);

}).on("mousemove", ".deletable", function () {

    if( $(window).data("isARealMouseDown") !== undefined &&
        $(window).data("isARealMouseDown") === true ) {

        var x           = Math.abs(arguments[0].pageX - ($(window).data("startx")));
        var y           = Math.abs(arguments[0].pageY - ($(window).data("starty")));
        var distance    = Math.sqrt( x*x + y*y );

        if(distance > 10) {
            /*
                if the distance is too large (larger than some arbitary threshold),
                then this is no longer a real mouse down. It becomes a mouse scroll
            */
            $(window).data('isARealMouseDown',false);
        }

    }

}).on("click", ".deletable", function () {
    $(window).data('isARealMouseDown',false);

    if(vm.flashCards.hideArrows()){
	    myScroll.disable();    
    }
})

function goToSpecificCardList(data, index, event) {
	
	if ($(window).data("isARealMouseDown")) {
		vm.flashCards.goToSpecificCardList(data, index, event);
	}
	
}

function removeSpecificCardList(data_list_summary_id, data_local_storage_id) {
	vm.removeCardListAction(data_list_summary_id, data_local_storage_id);
}
//--------------------------so user can delete a card list







