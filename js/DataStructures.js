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

var exporting = {};

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
exporting.CustomClass = CustomClass;

/**
 * Adds a section to a class, and performs validation against the schedule.
 */
var addSection = function(schedule, section) {
	checkNewSectionOverlap(schedule, section);
	this.sections.push(section);
	checkAllSectionOverlap(schedule, this.sections);
};
exporting.addSection = addSection;

/**
 * Removes a section from a class schedule.
 * @return true if a section was removed, false if no changes were made.
 */
var removeSection = function(schedule, serial) {
	var idx;
	for(let i = 0; i < schedule.length; i++) {
		if(schedule[i].identifier() === serial) {
			idx = i;
			break;
		}
	}
	if(typeof idx === 'undefined')
		return false;
	else {
		schedule.splice(index, 1);
		return true;
	}
};
exporting.removeSection = removeSection;

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
exporting.Section = Section;

/**
 * Because no two sections will occur at the same time on the same day, all the serialization
 * that is necessary is [enumerated day of week] concatenated to the [start time string].
 */
Section.prototype.identifier = function() {
	return this.day + this.start;
};

Section.prototype.splitStart = function() {
	var ret = this.start.split(":");
	if(ret.length != 2)
		throw new Error("Bad time string: " + this.start);
	else
		return ret;
};

Section.prototype.splitEnd = function() {
	var ret = this.end.split(":");
	if(ret.length != 2)
		throw new Error("Bad time string: " + this.start);
	else
		return ret;
};

/**
 * Ensures that an entered section is valid.
 */
Section.prototype.validate = function() {
	if(this.day < Week.SUN || this.day > Week.SAT)
		throw new Error("Invalid day of the week");
	if(compareTimes(this.start, this.end) > 0);
	else
		throw new Error("End time must come before start time");
};

/**
 * Checks if this section overlaps with another.
 * If one section's end time is the same as the other's start time, it will act as if there is no
 * overlap.
 */
Section.prototype.checkConflict = function(other) {
	var earlierEnd = this.end;
	var laterStart = other.start;
	var comp = compareTimes(this.start, other.start);
	if(comp == 0)
		throw new Error(this.name + " conflicts with " + other.name);
	else if(comp > 0) { // this comes after other
		earlierEnd = other.end;
		laterStart = this.start;
	}
	if(compareTimes(earlierEnd, laterStart) < 0)
		throw new Error("Schedule conflict detected between " + laterStart + " and " + earlierEnd);
};

/**
 * Compares two time strings. Returns 1 if the first arg is greater (i.e. comes later) than the other,
 * 0 if they're equal, and -1 if the first arg is less than the other.
 * If either time is a string, the function will attempt to convert it to an array of 2 elements.
 */
var compareTimes = function(time, other) {
	if(typeof time === 'string')
		time = time.split(":");
	if(typeof other === 'string')
		other = other.split(":");
	if(time.length != 2)
		throw new Error("Bad time string: " + time);
	if(other.length != 2)
		throw new Error("Bad time string: " + other);
	if(time[0] > other[0])
		return 1;
	else if(time[0] < other[0])
		return -1;
	else if(time[1] > other[1])
		return 1;
	else if(time[1] < other[1])
		return -1;
	else
		return 0;
};
exporting.compareTimes = compareTimes;

/**
 * Specifies a custom section not attached to a class object.
 * The two classes are idential, except this takes a class name as the first argument.
 */
var CustomSection = function(clazz, day, start, end, bldg, room, type, instr) {
	Section.apply(this, day, start, end, bldg, room, type, instr);
	this.clazz = clazz;
};
exporting.CustomSection = CustomSection;

/**
 * Checks a new section against the current schedule before attempting to add the class to the schedule.
 * @param {[Section]} sched the current class schedule.
 * @param {Section} the section to be added to the schedule.
 */
var checkNewSectionOverlap = function(sched, newSect) {
	for(let clazz of sched) {
		clazz.checkConflict(newSect);
	}
};
exporting.checkNewSectionOverlap = checkNewSectionOverlap;

/**
 * Checks all sections in the schedule for overlapping times. This should be called on the full schedule
 * whenever a change was made, just to make sure nobody did anything weird such as changing the cookies we
 * base-64 hashed.
 // TODO figure out how to resolve potential conflicts: nick says to just fail to load and display a page
 // saying "you know what you did"
 * @param {[Section]} sched the current class schedule.
 */
var checkAllSectionOverlap = function(sched) {
	for(let i = 0; i < sched.length; i++) {
		for(let j = i; j < sched.length; j++) {
			sched[i].checkConflict(sched[j]);
		}
	}
};
exporting.checkAllSectionOverlap = checkAllSectionOverlap;

module.exports = exporting;
