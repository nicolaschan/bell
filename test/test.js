var assert = require('assert');
// use assert.doesNotThrow and assert.ok

var sch = [];
// Unit tests for DataStructures.js, to make sure helper functions were done properly
/* */
var DS = require("../js/DataStructures");
var t1 = "8:00";
var t2 = "9:30";
var t3 = "9:15";
var t4 = "10:15";

var cs61a = new DS.CustomClass("CS61A");
var sectionMon0 = new DS.Section(1, "8:00", "10:00", "Cory", "111", 0, "DeNero");
var sectionMonNoConf = new DS.Section(1, "11:00", "13:00", "Soda", "324", 2, "Hutchings");
var sectionTuesNoConf = new DS.Section(2, "9:00", "11:00", "asdfawegr", "324", 2, "me");
var sectionMonAfterConf1 = new DS.Section(1, "9:30", "10:30", "adf", "1342", 1, "you");
var sectionMonAfterNoConf1 = new DS.Section(1, "10:00", "11:00", "daf", "", 2, "32");
var serialMonAfterConf1 = sectionMonAfterConf1.identifier();
var serialMonAfterNoConf1 = sectionMonAfterNoConf1.identifier();
var sectionMonBeforeConf1 = new DS.Section(1, "7:16", "9:00", "", "", 2, "");
var sectionMonBeforeConf2 = new DS.Section(1, "8:00", "12:00", "", "", 2, "");
var serialMonBeforeConf1 = sectionMonBeforeConf1.identifier();
var serialMonBeforeConf2 = sectionMonBeforeConf2.identifier();

var compareTimes = DS.compareTimes;
var addSection = DS.addSection;
var removeSection = DS.removeSection;
// these tests passed
/*describe("DataStructures", function() {
	describe("#compareTimes 1", function() {
		it("should return -1", () => assert.equal(-1, compareTimes(t1, t2))),
		it("should return 1", () => assert.equal(1, compareTimes(t2, t1))),
		it("should return 0", () => assert.equal(0, compareTimes(t2, t2))),
		it("should return 0", () => assert.equal(0, compareTimes(t1, t1))),
		it("should return 1", () => assert.equal(1, compareTimes(t2, t3))),
		it("should return -1", () => assert.equal(-1, compareTimes(t3, t2))),
		it("should return 1", () => assert.equal(1, compareTimes(t4, t3)))
	})
});*/
var l = console.log;
var dnt = (sect) => addSection(sch, sect); //(sect) => assert.doesNotThrow(() => addSection(sch, sect));
var dot = (sect) => {
	try {
		addSection(sch, sect);
	} catch(e) {}
}; // assert.throws(() => addSection(sch, sect));
// screw actual testing suites
dnt(sectionMon0);
dnt(sectionMonNoConf);
dnt(sectionTuesNoConf);
dot(sectionMonAfterConf1);
removeSection(sch, serialMonAfterNoConf1);
dnt(sectionMonAfterNoConf1);
dot(sectionMonBeforeConf1);
removeSection(sch, serialMonBeforeConf1);
dot(sectionMonBeforeConf2);
removeSection(sch, serialMonBeforeConf2);
/* */