var exporting = {};

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

// TODO associate sections with classes

/**
 * Adds a section to a schedule, and performs validation against the schedule.
 */
var addSection = function(schedule, section) {
	checkNewSectionOverlap(schedule, section);
	schedule.push(section);
	checkAllSectionOverlap(schedule);
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
		schedule.splice(idx, 1);
		return true;
	}
};
exporting.removeSection = removeSection;

/*
 * Specifies a section within a class.
 *
 * @param {Week} day specifies the day of the week.
 * @param {[Int]} time specifies start and end. I hope it was validated.
 */
var Section = function(day, time) {
	this.day = day;
	this.start = time[0];
	this.end = time[1];
};
exporting.Section = Section;

/**
 * Because no two sections will occur at the same time on the same day, all the serialization
 * that is necessary is [enumerated day of week] concatenated to the [start time string].
 */
Section.prototype.identifier = function() {
	return this.day + this.start;
};

/*
Section.prototype.splitStart = function() {
	var ret = this.start.split(":");
	if(ret.length != 2)
		throw new Error("Bad time string: " + this.start);
	else {
		ret[0] = parseInt(ret[0]);
		ret[1] = parseInt(ret[1]);
		return ret;
	}
};

Section.prototype.splitEnd = function() {
	var ret = this.end.split(":");
	if(ret.length != 2)
		throw new Error("Bad time string: " + this.start);
	else {
		ret[0] = parseInt(ret[0]);
		ret[1] = parseInt(ret[1]);
		return ret;
	}
};
*/

/**
 * Ensures that an entered section is valid.
 */
Section.prototype.validate = function() {
	if(compareTimes(this.start, this.end) > 0);
	else
		throw new Error("End time must come before start time");
};

/**
 * Checks if this section's time overlaps with another.
 * If one section's end time is the same as the other's start time, it will act as if there is no
 * overlap.
 */
Section.prototype.checkConflict = function(other) {
	if(this.day !== other.day)
		return;
	var earlierEnd = this.end;
	var laterStart = other.start;
	var comp = compareTimes(this.start, other.start);
	if(comp == 0)
		throw new Error(this.name + " conflicts with " + other.name);
	else if(comp > 0) { // this comes after other
		earlierEnd = other.end;
		laterStart = this.start;
	}
	if(compareTimes(earlierEnd, laterStart) > 0)
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
	time[0] = parseInt(time[0]);
	time[1] = parseInt(time[1]);
	other[0] = parseInt(other[0]);
	other[1] = parseInt(other[1]);
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
		for(let j = i + 1; j < sched.length; j++) {
			sched[i].checkConflict(sched[j]);
		}
	}
};
exporting.checkAllSectionOverlap = checkAllSectionOverlap;

module.exports = exporting;
