//localStorage.clear();
function flashCard(uniqueId, front, back, correct) {
    var self = this;

    self.id = uniqueId;       //int
    self.front = front;       //string
    self.back = back;         //array of strings

    //gets correctness from uniqueId
    self.isCorrect = ko.observable(correct);		
}

function flashCardList(uniqueId, list) {
    var self = this;

    self.id = uniqueId;         //int
    self.list = list;           //a list from local Storage	
}

function flashCards() {
    var self = this;

    self.isLocalStorageEmpty = function() {
		if (localStorage.getItem("meta_data") === null) {
			return true;
		}else{
			return false;
		}		
	}

    //-------------get meta_data for all the lists
	if (self.isLocalStorageEmpty()) {
		self.metaDataForAllLists    = {"sortState":"none", "summary": [], 'count':0};
		self.summarySortState       = self.metaDataForAllLists.sortState;	
	}else{
		self.metaDataForAllLists    = localStorage.getObject("meta_data");
		self.summarySortState       = self.metaDataForAllLists.sortState;	
	}
    

    /*
        the summarySortState can be none, nameForward, nameReversed, 
        gradeForward, gradeReversed
    */

    //--------------------load summary
    self.summary = ko.observableArray( self.metaDataForAllLists["summary"]);


    //---------------------------------------------initializes app
    self.flashCardId    = ko.observable(0);
    self.flashCardArray = ko.observableArray([new flashCard(0,'','')]); //makes a dummy card
    self.numberOfCards  = 0;
    self.percentageCorrect = ko.observable('nada');
    self.currentView    = ko.observable('home');
    self.hideCheckers   = ko.observable(true);
    self.hideArrows     = ko.observable(true);
    self.frontText      = ko.observable();
    self.backText       = ko.observable();
    self.displayNextButton = ko.observable(false);
    self.displayPreviousButton = ko.observable(false);
    self.checkerClicked = false;        //when the user click on a checker
    self.showListGrade  = ko.observable(false);
    self.studyMode      = ko.observable('study');
    self.lastActiveElement = "nada";
    self.shouldUpdateCardData = false;
    self.cardListName   = ko.observable('');
    self.listId         = 'nada';
    self.hideAllModals	= ko.observable(true);
    //---------------------------------------------initializes app


    self.compareSummaryNames = function(a,b) {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
          return -1;
        // a must be equal to b
        }
        return 0;
    }

    self.compareSummaryGrades = function(a,b) {
        a.grade = parseFloat(a.grade);
        b.grade = parseFloat(b.grade);
        if (a.grade > b.grade) {
            return 1;
        }
        if (a.grade < b.grade) {
          return -1;
        // a must be equal to b
        }
        return 0;
    }


    self.sortSummaryByNames = function() {
        //note I don't sort the observable directly, that would be resource intensive
        var localArray = self.summary();
        
        if (self.summarySortState == "nameForward") {
            //if sorted by name, then reverse the list
            localArray.reverse();
            self.summarySortState = "nameReversed";
        } else {
            //otherwise sort by name
            localArray.sort(self.compareSummaryNames);
            self.summarySortState = "nameForward";
        }
        self.showListGrade(false);
        self.summary(localArray);
    }

    self.sortSummaryByGrades = function() {
        //note I don't sort the observable directly, that would be resource intensive
        var localArray = self.summary();
        
        if (self.summarySortState == "gradeReversed") {
            self.showListGrade(false);
            self.summarySortState = "none";
            return;
        }

        if (self.summarySortState == "gradeForward") {
            //if sorted by name, then reverse the list
            localArray.reverse();
            self.summarySortState = "gradeReversed";
        } else {
            //otherwise sort by name
            localArray.sort(self.compareSummaryGrades);
            self.summarySortState = "gradeForward";
        }
        self.showListGrade(true);
        self.summary(localArray);
    }

    //----------------------------------------sorts the summary
        self.sortSummaryByNames();                
    //----------------------------------------sorts the summary

    self.checkIfShouldShowNextButton = function() {
        if(self.flashCardId() < self.numberOfCards) {
            self.displayNextButton(true);
        } else {
            self.displayNextButton(false);
        }
    }

    self.checkIfShouldShowPreviousButton = function() {
        if( self.flashCardId() > 0 ||
            (self.numberOfCards===1 && self.currentView() === "result") ||
            self.studyMode() === 'edit'
          ) {
            self.displayPreviousButton(true);
        } else {
            self.displayPreviousButton(false);
        }   
    }

    self.showPlusButtonForNextArrow = function() {
        if(self.studyMode() === "edit" && self.flashCardId()+1 === self.numberOfCards) {
            return true;
        }
        return false;
    }

    self.initializeStudyMode = function(id, indexOfCardListInSummary) {


        //get data for list1 from local storage
        var local_data = localStorage.getObject("list"+id);
        self.summaryIndex = indexOfCardListInSummary;
        self.listId         = id;
        self.flashCardId(0);
        self.list_data      = local_data.list_data;
        self.meta_data      = local_data.meta_data;
        self.flashCardArray([]);
        self.numberOfCards  = self.list_data.length;
        self.studyMode('study');
        self.cardListName(self.meta_data.name);



        // -------------------generateflashCardArrayFromData
            var correct;
            for(var i=0; i<self.numberOfCards; i++) {

                correct = 0;                        
                if( typeof self.list_data[i].correct !== "undefined" ) {
                    correct = self.list_data[i].correct;
                }

                self.flashCardArray.push( new flashCard(i, self.list_data[i].front,
                self.list_data[i].back, correct) );
            }
        // -------------------generateflashCardArrayFromData

        // --------------- initialize current flash on card 
        self.frontText( self.flashCardArray()[self.flashCardId()].front );
        self.backText( self.flashCardArray()[self.flashCardId()].back );

        self.currentView('front');

        self.hideCheckers(false);
        self.hideArrows(false);

        self.checkIfShouldShowPreviousButton();
        self.checkIfShouldShowNextButton();
        self.saveListChanges();
        self.checkerClicked = false;

    }


    self.initializeEditMode = function(id) {

        //get data for list1 from local storage
        var local_data = localStorage.getObject("list"+id);
        self.summaryIndex   = id;
        self.listId         = id;
        self.flashCardId(0);
        self.list_data      = local_data.list_data;
        self.meta_data      = local_data.meta_data;
        self.flashCardArray([]);
        self.numberOfCards  = self.list_data.length;
        self.studyMode('edit');
        self.cardListName(self.meta_data.name);

        // -------------------generateflashCardArrayFromData
            var correct;
            for(var i=0; i<self.numberOfCards; i++) {

                correct = 0;
                if( typeof self.list_data[i].correct !== "undefined" ) {
                    correct = self.list_data[i].correct;
                }

                self.flashCardArray.push( new flashCard(i, self.list_data[i].front, 
                self.list_data[i].back, correct) );
            }
        // -------------------generateflashCardArrayFromData

        // --------------- initialize current flash on card
        self.frontText( self.flashCardArray()[self.flashCardId()].front );
        self.backText( self.flashCardArray()[self.flashCardId()].back );

        self.currentView('front');

        self.hideCheckers(false);
        self.hideArrows(false);

        self.checkIfShouldShowPreviousButton();
        self.checkIfShouldShowNextButton();
    }

    self.toggleSide = function() {

        if( self.currentView() === 'front') {
            self.currentView('back');
        } else if( self.currentView() === 'back') {
            self.currentView('front');
        }
        myScroll.refresh();                     //calculates new height for scrolling elements when switching sides
    }	

    self.updateCardUi = function() {
        myScroll.refresh();                     //calculates new height for scrolling elements
        myScroll.scrollTo(0, 0, 0, false);      //scrolls to top of scrolling element
    }

    self.updateCardFrontBackText = function() {
        self.frontText( self.flashCardArray()[self.flashCardId()].front );
        self.backText( self.flashCardArray()[self.flashCardId()].back );
    }

    self.increaseId = function() {
        self.checkIfShouldShowNextButton();

        if(self.displayNextButton()) {

            if (self.showPlusButtonForNextArrow()) {
                self.addNewCard();
                self.currentView('front');
            } else if(self.flashCardId() === self.numberOfCards -1) {
                self.currentView('result');
                self.hideCheckers(true);
                self.calculatePercentage();
            } else {
	            self.flashCardId( self.flashCardId() + 1 );
                self.currentView('front');
            }

            self.updateCardFrontBackText();
            self.checkIfShouldShowPreviousButton();
            self.checkIfShouldShowNextButton();
            self.updateCardUi();

        }
    }	

    self.decreaseId = function() {
        self.checkIfShouldShowPreviousButton();

        if(self.displayPreviousButton()) {


            if (self.studyMode() === 'edit' && self.flashCardId() === 0) {
                self.hideCheckers(true);
                self.hideArrows(true);
                $("#enter_name_input").val(self.meta_data.name);
                self.currentView('enter_name');

            } else if(self.currentView() !== 'result') {
                self.flashCardId( self.flashCardId() - 1 );
                self.currentView('front');

            } else if( self.flashCardId() === self.numberOfCards -1) {
                self.hideCheckers(false); 
                self.hideArrows(false);
                self.currentView('front');
            }

            self.updateCardFrontBackText();
            self.checkIfShouldShowPreviousButton();
            self.checkIfShouldShowNextButton();
            self.updateCardUi();
        }

    }

    /* 
        the is correct property has 3 states, 
        0  = no buttons selected
        1  = correct button selected (check mark)
        -1 = incorrect button selected (x-mark)
    */
    self.correctButtonPushed = function(flashCardElement) {
        if(flashCardElement.isCorrect()===1) {
            //check mark was already selected, so deselect it
            flashCardElement.isCorrect(0);
        } else{
            //check mark was not selected
           flashCardElement.isCorrect(1); 
        }
        
        //update data
        self.list_data[flashCardElement.id].correct = flashCardElement.isCorrect();
        self.checkerClicked = true;
    }


    self.incorrectButtonPushed = function(flashCardElement) {
        if(flashCardElement.isCorrect()===-1) {
            //x mark was already selected, so deselect it
            flashCardElement.isCorrect(0);
        } else{
            //x mark was not selected
           flashCardElement.isCorrect(-1); 
        }
        //update data
        self.list_data[flashCardElement.id].correct = flashCardElement.isCorrect();
        self.checkerClicked = true;
    }

    self.calculatePercentage = function() {
        /*
            loops through and calculates percentage,
            note if a card is left not graded (has a isCorrect() === 0),
            then it is not counted in the calculation
        */
        var totalGraded     = 0;
        var totalCorrect    = 0;
        var percentCorrect  = 0;

        for(var i=0; i<self.numberOfCards; i++) {
            

            if(self.flashCardArray()[i].isCorrect() === 1) {

                totalCorrect++;
                totalGraded++;
            } else if (self.flashCardArray()[i].isCorrect() === -1) {
                
                totalGraded++;
            }                    
        }
                 
                    
        if (totalGraded >0) {
            percentCorrect  = Math.round( (totalCorrect/totalGraded) * 100).toString();
        }

        self.percentageCorrect(percentCorrect);  
        self.meta_data["grade"] = percentCorrect;
        self.metaDataForAllLists.summary[self.summaryIndex].grade = percentCorrect;
        self.summary([]);
        self.summary(self.metaDataForAllLists.summary);

    }

    self.saveListChanges = function() {
        /* 
            code swaps the local storage data with self.list_data data
            essentially, the code updates this list
            code updates the summary as well in case any list names changed
         */

        //-----save if needed
        if (self.checkerClicked) {
            self.calculatePercentage();
            localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );
            self.metaDataForAllLists.sortState = self.summarySortState;
            localStorage.setObject("meta_data", self.metaDataForAllLists);
            self.summary( self.metaDataForAllLists["summary"]);
            self.checkerClicked = false;
        }
    }

    self.chooseList = function() {
        self.currentView('choose');
        self.hideCheckers(true);
        self.hideArrows(true);
        self.hideAllModals(true);
        self.updateCardUi();
        self.saveListChanges();
    }

    self.homeScreen = function() {
        self.currentView('home');
        self.hideCheckers(true);
        self.hideArrows(true);
        self.updateCardUi();
        self.saveListChanges();
    }

    self.studyCards = function() {
        self.studyMode('study');
        self.checkIfShouldShowPreviousButton();
        self.updateCardUi();
    }
    self.editCards = function() {
        self.studyMode('edit');
        self.checkIfShouldShowPreviousButton();
        self.updateCardUi();
    }

    self.isOdd = function(number) {
        /*
            if the modulus of a number and 2 is not 0, 
            then it is odd
        */
        return ( parseInt(number) % 2 ) !== 0;
    }

    self.goToSpecificCardList = function(data, indexOfCardListInSummary) {
        var indexOfCardListInLocalStorage = data.id;
        self.initializeStudyMode(indexOfCardListInLocalStorage, indexOfCardListInSummary);
        self.updateCardUi();
    }

    self.exitApp = function() {

       if (self.checkerClicked) {
            self.saveListChanges();
            self.calculatePercentage();
        }
        navigator.app.exitApp();
    }

    self.chooseCreate = function() {
        self.currentView('enter_name');
        self.studyMode('edit');
        self.cardListName('');
        self.listId = 'nada';
    }

    self.updateFrontData =  function(front_text) {
        self.frontText(front_text)
        self.flashCardArray()[self.flashCardId()].front = front_text;
        self.list_data[self.flashCardId()]["front"]     = front_text;    
        localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );
    }

    self.updateBackData =  function(back_text) {
        self.backText(back_text)
        self.flashCardArray()[self.flashCardId()].back  = back_text;
        self.list_data[self.flashCardId()]["back"]      = back_text;
        localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );
    }

    self.saveCard = function() {

        if( self.currentView()==='front') {
            var front_text = $("#edit_front").val();
            self.updateFrontData(front_text);
        } else {
            var back_text = [];
            var edit_back_elements = $(document.getElementsByClassName('edit_back'));
            var i = 0;
            while (i < edit_back_elements.length) {
                back_text.push($(edit_back_elements[i]).val());
                i++;
            }
            self.updateBackData(back_text);
        }
        self.shouldUpdateCardData = false;
    }

    self.removeThisTextField = function(index) {  
        var back_text = removeItemFromArray(self.list_data[self.flashCardId()]["back"], index);  
        self.updateBackData(back_text);
    }

    self.addNewTextField = function() {
        //saves current state of cards
        self.saveCard();

        //----------------adds a new blank card to cards
        var back_text   = new Array("");
        back_text       = back_text.concat(self.backText());
        self.backText(back_text);
        //----------------adds a new blank card to cards

        //saves new state of cards
        self.saveCard();
        
        /*
         * this is so the flashcard will still be scrollable 
         * after adding a text field 
         */
        vm.flashCards.updateCardUi();
    }

    self.addNewCard = function() {
        /*
            code does the following:
            (1) appends new card information to the list_data
            (2) appends new card information to the flashCardArray
            (3) increases the numberOfCards by one
            (4) set the flashCardId() to numberOfCards-1
            (5) update localStorage
        */

        var localNewCardListData = {
        "front"	    : 	"",
	    "back"	    : 	[""]
        };

        self.list_data.push(localNewCardListData);
        self.flashCardArray.push(   new flashCard(self.numberOfCards,
                                    self.list_data[self.numberOfCards].front,
                                    self.list_data[self.numberOfCards].back, 0) 
        );
        self.numberOfCards++;
        self.flashCardId(self.numberOfCards-1);
        localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );            
    }

    self.workOnCardList = function() {
        if(self.listId === 'nada') {
            //user is creating a new cardlist
            /*
                Code does the following:
                (0) gets the new cardListName
                (1) gets the new cardlistindex
                (2) appends the new card list data and meta data to localStorage
                (3) appends new card meta data to the metaDataForAllLists
                (4) sets the localStorage overall metadata as metaDataForAllLists
                (5) sorts the cards
            */

            var newCardListName     = $("#enter_name_input").val();
            if  (self.isLocalStorageEmpty()){
				var numberOfCardLists = 0;
				
			}else{
				var numberOfCardLists = self.metaDataForAllLists.count;
				
			}
			
			self.metaDataForAllLists.count++;
            var newCardListIndex    		= numberOfCardLists;
            var meta_data           		= {"name":newCardListName, "grade":"0"};
            var list_data           		= [
                {
                    "front"	    : 	"",
	                "back"	    : 	[""]
                }
            ];
            var newCardOverAllMetaData  = {"id":newCardListIndex, "name":newCardListName, "grade":"0" };

            localStorage.setObject("list"+newCardListIndex.toString(), {"meta_data": meta_data, "list_data": list_data} );
            self.metaDataForAllLists.summary.push(newCardOverAllMetaData);
            localStorage.setObject("meta_data", self.metaDataForAllLists);

            self.summarySortState == "nameReversed"
            self.sortSummaryByNames();

            self.initializeEditMode(newCardListIndex);


        } else {
            //user is editing name a pre-existing cardlist
            self.hideCheckers(false);
            self.hideArrows(false);
            self.currentView('front');
            self.meta_data.name = $("#enter_name_input").val();

            //------change the name of the meta data in summary which matches the cardlist id
            var numberOfCardLists = self.metaDataForAllLists.summary.length;
            for(var i=0; i<numberOfCardLists; i++) {
                if(self.metaDataForAllLists.summary[i].id === self.listId) {
                    self.metaDataForAllLists.summary[i].name = self.meta_data.name;
                    break;
                }
            }
            //------change the name of the meta data in summary which matches the cardlist id
            self.summarySortState == "nameReversed"
            self.sortSummaryByNames();
            self.checkerClicked = true;
            self.saveListChanges();
        }

    }
    
	self.removeCardFromFlashCardArray = function(current_card_index){
		//(1) get local summary
		//(2) modify local summary by removing index of interest
		//(3) make flashCardArray equal to local summary
		var local_summary = self.flashCardArray();
		local_summary.splice(current_card_index, 1);	
		self.flashCardArray(local_summary);	
	}    
    
	self.deleteFlashCard = function(){		
        /*
            code does the following:
            (0) get currnt card index
            (1) removes card information from the list_data
            (2) removes card information from the flashCardArray
            (3) decreases the numberOfCards by one
            (4) update localStorage
        */

		var current_card_index	= self.flashCardId();
		self.list_data.splice(current_card_index, 1);
		self.removeCardFromFlashCardArray(current_card_index);
        self.numberOfCards--;
        localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );  
        
        /*
         *Note that b/c an element was deleted from the list_data, the current_card_index refers
         *to the next element in the list_data list 
         */
		if(typeof self.list_data[current_card_index] != 'undefined') {
			// card infront does exist
			self.increaseId();
		}
		else {
			// assumes the card behind exists
			self.decreaseId();
		}         

		
        vm.hideModals();      		
	}

}

function system() {
    var self = this;
    self.flashCards = new flashCards();
    
    self.hideAllModals	= ko.observable(true);
	self.indexOfCardListInSummaryToDelete		= ko.observable('nada');
	self.indexOfCardListInLocalStorageToDelete	= ko.observable('nada');
    
    self.hideModals = function() {
		self.hideAllModals(true);
	}	
	
    self.showModals = function() {
		self.hideAllModals(false);
	}	
	
	self.removeCardListFromFlashCardListSummary = function(indexOfCardListInSummaryToDelete){
			
		//(1) get local summary
		//(2) modify local summary by removing index of interest
		//(3) make flashCard summary equal to local summary
		var local_summary = self.flashCards.summary();
		local_summary.splice(indexOfCardListInSummaryToDelete(), 1);	
		self.flashCards.summary(local_summary);	
	}
	
	self.makeLocalStorageMetaDataMatchFlashCardListMetaData = function(){
	
		//(4) the flashcard meta data list is automatically updated when the summary list is updated
		//save those changes to the meta data list to the localStorage
        self.flashCards.metaDataForAllLists.sortState = self.flashCards.summarySortState;
        localStorage.setObject("meta_data", self.flashCards.metaDataForAllLists);		
		
	}
	
	self.deleteListFromLocalStorage = function(indexOfCardListInLocalStorageToDelete){
	
		//(5) get list id to delete
		//(6) delete value by the list id from localStorage
		var listToDeleteInLocalStorage = "list"+indexOfCardListInLocalStorageToDelete;
        delete localStorage[listToDeleteInLocalStorage];		
	}
	
    self.deleteCardList = function() {
		self.hideModals();
		self.removeCardListFromFlashCardListSummary(self.indexOfCardListInSummaryToDelete);
		self.makeLocalStorageMetaDataMatchFlashCardListMetaData();
		self.deleteListFromLocalStorage(self.indexOfCardListInLocalStorageToDelete()); 
		vm.flashCards.updateCardUi();           		
	}	

	self.removeCardListAction = function(data_list_summary_id, data_local_storage_id){
		self.indexOfCardListInSummaryToDelete(data_list_summary_id);
		self.indexOfCardListInLocalStorageToDelete(data_local_storage_id);
		self.showModals();
	}	
	
}

var vm = new system();
ko.applyBindings(vm);
