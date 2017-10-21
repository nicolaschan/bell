$ = require 'jquery'
selectize = require 'selectize'

cookieManager = require './CookieManager2'
requestManager = require './RequestManager'
ThemeManager = require './ThemeManager'

themeManager = new ThemeManager cookieManager

global.cookieManager = cookieManager
global.themeManager = themeManager

$ ->

  source = cookieManager.get 'source'
  requestManager.get("/api/data/#{source}/meta").then (meta) ->
    unless meta.periods
      return window.location.href = '/settings'

    $('#periods-title').text meta.name

    textFieldIndex = 0
    generateTextFieldRow = (name) ->
      row = $ "<tr></tr>"
      row.append $("<td class='tableLabel'></td>").text(name)
      row.append $("<td class='tableInput'></td>").append $("<input class='inputBox' type='text' placeholder='#{name}' maxlength='20' id='text#{textFieldIndex}'>")

      checkbox = $("<input type='checkbox' class='checkbox' id='check#{textFieldIndex}' checked></input>")
      checkbox.click (e) ->
        index = e.currentTarget.id.substring(5)
        textField = $("\#text#{index}")
        textField.attr('disabled', not e.currentTarget.checked)
        textField.val if e.currentTarget.checked then '' else 'Free'
        if e.currentTarget.checked
          textField.focus()
      row.append $("<td class='tableCheckbox'></td>").append(
        $("<label class='control control--checkbox'></label>").append(
          checkbox, $("<div class='control__indicator'></div>")))
      textFieldIndex++
      return row

    savedPeriods = cookieManager.get 'periods', {}
    for period in meta.periods
      row = generateTextFieldRow period
      periodName = savedPeriods[period] or period
      if periodName is 'Free'
        $(row.children()[1].children[0]).attr('disabled', true)
        $(row.children()[2].children[0].children[0]).attr('checked', false)
      $(row.children()[1].children[0]).val savedPeriods[period] or period
      $('#scheduleEntryTable').append(row)

    

  # Done button
  $('#doneIcon').click ->
    savedPeriods = {}
    for row in $('#scheduleEntryTable').children()
      savedPeriods[$($(row).children()[0]).text()] = $($(row).children()[1].children[0]).val()
    cookieManager.set('periods', savedPeriods);
    window.location.href = '/settings'