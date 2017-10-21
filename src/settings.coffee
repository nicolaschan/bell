$ = require 'jquery'
selectize = require 'selectize'

cookieManager = require './CookieManager2'
requestManager = require './RequestManager'
ThemeManager = require './ThemeManager'

themeManager = new ThemeManager cookieManager

global.cookieManager = cookieManager
global.themeManager = themeManager

$ ->

  # Selectize initialization
  hasLoaded = no # Keep track of when it first loads
  sourceSelector = $('select#source').selectize
    valueField: 'id'
    searchField: ['name', 'id']
    options: [
      {name: 'Custom', id: 'custom'}
    ]
    load: (query, callback) ->
      requestManager.get("/api/sources?query=#{query}").then callback
    preload: yes
    render:
      item: (item, escape) -> "<div><b>#{item.name}</b> (#{item.id})</div>"
      option: (item, escape) -> "<div><b>#{item.name}</b> (#{item.id})</div>"
    onChange: (value) -> 
      cookieManager.set 'source', value # Set source cookie
      if value is 'custom'
        $('#edit-classes-button').prop 'href', '/classes'
        $('#edit-classes-button').text 'Edit Classes'
      else
        requestManager.get("/api/data/#{value}/meta").then (meta) ->
          $('#edit-classes-button').prop 'href', if meta.periods then '/periods' else '/classes' 
          $('#edit-classes-button').text if meta.periods then 'Edit Periods' else 'Edit Classes' 
    onLoad: (data) -> 
      unless hasLoaded
        sourceSelector[0].selectize.setValue cookieManager.get('source', 'lahs')
        hasLoaded = yes

  themeSelector = $('select#theme').selectize
    valueField: 'name'
    searchField: ['name']
    options: (Object.keys themeManager.getAvailableThemes()).map((x) -> { name: x })
    render:
      item: (item, escape) -> "<div><b>#{item.name}</b></div>"
      option: (item, escape) -> "<div><b>#{item.name}</b></div>"
    onChange: (value) -> themeManager.setCurrentTheme value

  themeSelector[0].selectize.setValue themeManager.getCurrentThemeName()

  # Done button
  $('#doneIcon').click -> window.location.href = '/'