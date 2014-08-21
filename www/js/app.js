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

function app() {
    var self = this;

    //-------------get meta_data for all the lists
    self.metaDataForAllLists    = localStorage.getObject("meta_data");
    self.summarySortState       = self.metaDataForAllLists.sortState;
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
        if((self.flashCardId() > 0) || (self.numberOfCards===1 && self.currentView() === "result") ) {
            self.displayPreviousButton(true);
        } else {
            self.displayPreviousButton(false);
        }   
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
            if (self.flashCardId() === self.numberOfCards -1) {
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

            if (self.currentView() !== 'result') {
                self.flashCardId( self.flashCardId() - 1 );                      
            } else if( self.flashCardId() === self.numberOfCards -1) {
                self.hideCheckers(false); 
                self.hideArrows(false); 
            }
            self.currentView('front');

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
         */

        //-----save if needed when user
        if (self.checkerClicked) {
            self.calculatePercentage();
            localStorage.setObject("list"+self.listId, {"meta_data": self.meta_data, "list_data": self.list_data} );
            self.metaDataForAllLists.sortState = self.summarySortState;
            localStorage.setObject("meta_data", self.metaDataForAllLists);                
            self.checkerClicked = false;
        }
    }

    self.chooseList = function() {
        self.currentView('choose');
        self.hideCheckers(true);
        self.hideArrows(true);
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
    }
    self.editCards = function() {
        self.studyMode('edit');
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
    }

    self.initializeEditMode = function(id, indexOfCardListInSummary) {
    }
}
//------------------------creates an instance of the app called vm and applies bindings to it
var vm = new app();
ko.applyBindings(vm);
//------------------------creates an instance of the app called vm and applies bindings to it

