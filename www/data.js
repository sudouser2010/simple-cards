meta_data0 = {"name":"computer terminology", "grade":0};
list_data0 = [
    {
    "front"	    : 	"kernel",
	"back"	    : 	["software used to manage a computer's hardware and software systems"]
    },

    {
    "front"	: 	"shell",
	"back"	: 	["a command line interface used to talk to the kernel", 
				 "There are different flavors such as bash (bourne again shell scripting)"
				]
    },
    {
    "front"	: 	"python byte code",
	"back"	: 	["a compiled Python source code", 
				 "has a .pyc extension (for Python compiled)",
                 "computer creates .pyc files only if Python has write access on machine (probably does)"
				]
    }

];


meta_data1 = {"name":"physics", "grade":0};
list_data1 = [
    {
    "front"	    : 	"Isaac Newton",
	"back"	    : 	["was the co-inventor of Calculus", "described gravity with mathematics"]
    },

    {
    "front"	: 	"James Clerk Maxwell",
	"back"	: 	["the father of electromagnetism", 
				 "said that electromagnetic waves move at the speed of light"
				]
    },
    {
    "front"	: 	"strong nuclear force",
	"back"	: 	["binds the nucleus of atoms together"
				]
    }

];



meta_data2 = {"name":"american government", "grade":0};
list_data2 = [
    {
    "front"	    : 	"George Washington",
	"back"	    : 	["was the first United States President"]
    },

    {
    "front"	    : 	"Bill Clinton",
	"back"	    : 	["the coolest president ever", 
                    "vowed to put a computer in every classroom"]
    }

];

meta_data3 = {"name":"gre vocabulary", "grade":0};
list_data3 = [
    {
    "front"	    : 	"abet",
	"back"	    : 	["to help", "to aid", "to encourage"]
    },
    {
    "front"	    : 	"accolade",
	"back"	    : 	["tribute", "honor", "praise"]
    },
    {
    "front"	    : 	"resolution",
	"back"	    : 	["determination"]
    },
    {
    "front"	    : 	"abhor",
	"back"	    : 	["to hate", "to detest"]
    },
    {
    "front"	    : 	"kindle",
	"back"	    : 	["to start a fire"]
    },
    {
    "front"	    : 	"Absolution",
	"back"	    : 	["forgiveness", "pardon", "release"]
    },
];



summary = [
                {"id":0, "name":meta_data0["name"], "grade": meta_data0["grade"] },
                {"id":1, "name":meta_data1["name"], "grade": meta_data1["grade"] },
                {"id":2, "name":meta_data2["name"], "grade": meta_data2["grade"] },
                {"id":3, "name":meta_data3["name"], "grade": meta_data3["grade"] },
];

//localStorage.clear(); //clears local storage, for development purposes

/* if list0 is not defined */

if (localStorage.getItem("list0") === null) {
    localStorage.setObject("meta_data", {"sortState":"none", "summary": summary, 'count':4});
    localStorage.setObject("list0", {"meta_data": meta_data0, "list_data": list_data0} );
    localStorage.setObject("list1", {"meta_data": meta_data1, "list_data": list_data1} );
    localStorage.setObject("list2", {"meta_data": meta_data2, "list_data": list_data2} );
    localStorage.setObject("list3", {"meta_data": meta_data3, "list_data": list_data3} );
    //alert("data is refreshed");
}

//---------------------------------------------




