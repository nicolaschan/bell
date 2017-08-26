const $ = require('jquery');

var generateSectionInputField = function() {
  var id = Date.now();
  var output = $('<div id="' + id + '" class="section"></div>');
  var select = $('<select></select>');
  var options = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(function(day) {
    return '<option value="' + day + '">' + day + '</option>';
  });
  select.append(options);
  var startTimeField = $('<input type="text" class="inputBox time-entry" placeholder="Start Time" maxlength="10"></input>');
  var endTimeField = $('<input type="text" class="inputBox time-entry" placeholder="End Time" maxlength="10"></input>');;
  output.append(select);
  output.append(startTimeField);
  output.append(endTimeField);
  var deleteButton = $('<a class="dismiss center-vertical delete-section" href="#"><i class="material-icons">cancel</i></a>');
  deleteButton.click(function() {
      $('#' + id).remove();
  });
  output.append(deleteButton);
  return output;
};

$(function() {
  $('#add-section-button').click(function() {
    $('#enter-section').append(generateSectionInputField());
  });
});
