'use strict';

// To show when the last refresh of rates were
var lastRefreshed = getDate();

// TODO have different base currencies
var base = 'USD';

// For displaying currencies alphabetically
var countries = [];
for (let key of Object.keys(currencies)){
  countries.push(key);
}
countries.sort();

function refreshRates(info, tab){
  lastRefreshed = getDate();

  var request = new XMLHttpRequest();
  request.open('GET', 'https://api.exchangeratesapi.io/latest?base=USD', true);
  request.send();
  request.onload = function() {
    var data = JSON.parse(this.response);
    var rates = data.rates;

    // Save rates to chrome storage
    chrome.storage.local.set(rates);
  }
}

function source(){
  window.open('https://www.github.com/darrenhum', '_blank');
}

function debugFunction(){
  /*
  for (let key of Object.keys(currencies)){
    console.log(key + ': ' + currencies[key]);
  }
  */

  var allCurrencies = [];
  for (let key of Object.keys(currencies)){
    allCurrencies.push(key);
  }

  chrome.storage.local.get(['USD'], function(result){
    console.log(result);
  });

  // To get all values
  /*
  chrome.storage.local.get(null, function(result) {
    console.log(result);
  });
  */
}

function convertOnClick(info, tab){
  refreshRates();

  var menuItem = info.menuItemId;

  chrome.storage.local.get(menuItem, function(result){
    var rate = result[menuItem];
    console.log(rate);

    // Strip all but numbers and decimal
    var amount = parseFloat(info.selectionText.replace(/[^0-9.]/g, ""));
    
    // Only continue if highlighted contains numbers
    if(isNaN(amount))
      return;
      //throw 'Not a float';

    var result = amount * result[menuItem];
    // Format result string, two decimal places
    result = '$' + result.toFixed(2).toString();

    var title = base + ' to ' + menuItem;

    var notifOptions =  {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: title,
      message: result.toString(),
      silent: true, // No notification sound
      requireInteraction: true  // Persists till user closes
    };
    chrome.notifications.create('result', notifOptions); 
  });
}

// Returns all rates saved 
function getAllRates(){
  chrome.storage.local.get(null, function(result) {
    console.log(result);
  });
}

function getDate(){
  var current_datetime = new Date();

  var date = current_datetime.getFullYear() + '/' + (current_datetime.getMonth() + 1) + '/' + current_datetime.getDate();

  return date;
}

chrome.runtime.onInstalled.addListener(function() {
  refreshRates();

  chrome.contextMenus.create({
    title: 'Last refreshed: ' + lastRefreshed + ' (click to refresh)',
    type: 'normal',
    contexts: ['page', 'selection'],
    onclick: refreshRates
  });
  
  for (let key of Object.keys(currencies)) {
    chrome.contextMenus.create({
      id: key,
      title: key,
      type: 'normal',
      contexts: ['selection'],
      onclick: convertOnClick
    });
  }

  chrome.contextMenus.create({
    title: 'Source',
    contexts: ['page'],
    onclick: source
  });

  /*
  chrome.contextMenus.create({
    title: 'Debug',
    contexts: ['page'],
    onclick: debugFunction
  });
  */
});

chrome.storage.onChanged.addListener(function(list, sync) {
  let newlyDisabled = [];
  let newlyEnabled = [];
  console.log(list);

  if (!('removedContextMenu' in list))
    return;
    
  let currentRemoved = list.removedContextMenu.newValue;
  let oldRemoved = list.removedContextMenu.oldValue || [];

  for (let key of Object.keys(currencies)) {
    if (currentRemoved.includes(key) && !oldRemoved.includes(key)) {
      newlyDisabled.push(key);
    } else if (oldRemoved.includes(key) && !currentRemoved.includes(key)) {
      newlyEnabled.push({
        id: key,
        title: key
      });
    }
  }

  console.log(newlyEnabled);
  for (let locale of newlyEnabled) {
    chrome.contextMenus.create({
      id: locale.id,
      title: locale.title,
      type: 'normal',
      contexts: ['selection'],
    });
  }
  for (let locale of newlyDisabled) {
    chrome.contextMenus.remove(locale);
  }
});
