var Week = {
	SUN: 0,
	MON: 1,
	TUE: 2,
	WED: 3,
	THU: 4,
	FRI: 5,
	SAT: 6
};

var ClassType = {
	DISC: 0,
	LEC: 1,
	LAB: 2
};


// TODO
// have the user first enter a class, then set specifics for disc/lec/lab
// with alternative option to enter a custom block

/**
 * Specifies a custom class period.
 * 
 * @param {String} name the name of the class
 */
var CustomClass = function(name) {
	this.name = name;
	this.sections = [];
};

/*
 * Specifies a section within a class.
 *
 * @param {Week} day specifies the day of the week.
 * @param {String} start specifies the start time of the class. Must be formatted as "xx:xx".
 * @param {String} end specifies the end time of the class. Must be formatted as "xx:xx:".
 * @param {String} bldg the building in which the class takes place.
 * @param {int} room the number of the room in which the class is held.
 * @param {ClassType} the type of session this schedule block is is.
 * @param {String} the name of the instructor.
 */
var Section = function(day, start, end, bldg, room, type, instr) {
	this.day = day;
	this.start = start;
	this.end = end;
	this.bldg = bldg;
	this.room = room;
	this.instr = instr;
};
