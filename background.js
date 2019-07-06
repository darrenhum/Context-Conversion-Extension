'use strict';

// To show when the last refresh of rates were
// TODO remove?
var lastRefreshed = getDate();

function source(){
  window.open('https://github.com/darrenhum/Context-Conversion-Extension', '_blank');
}

function debugFunction(){
  saveRatePair('USD', 'GBP');
}

function convertOnClick(info, tab){
  console.log(info);
  console.log(tab);
  
  var menuItem = info.menuItemId;

  chrome.storage.sync.get(menuItem, function(result){
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

    var base = menuItem.substring(0,3);
    var target = menuItem.substring(3,6);
    var title = base + ' to ' + target;

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

function getDate(){
  var current_datetime = new Date();

  var date = current_datetime.getFullYear() + '/' + (current_datetime.getMonth() + 1) + '/' + current_datetime.getDate();

  return date;
}


chrome.runtime.onInstalled.addListener(function() {
  console.log("onInstall");
  saveRatePair('USD', 'CAD');
  createSource();
  createContext();
  /*
  chrome.contextMenus.create({
    title: 'Last refreshed: ' + lastRefreshed + ' (click to refresh)',
    type: 'normal',
    contexts: ['page', 'selection'],
    onclick: refreshRates
  });
  */
});

chrome.runtime.onStartup.addListener(function(){
  console.log("onStartup");
  createSource();
  createContext();
});

function createContext(){
  chrome.storage.sync.get(null, function(result){
    for (let key of Object.keys(result)) {
      chrome.contextMenus.create({
        id: key,
        title: key.substring(0,3) + ' -> ' + key.substring(3,6),
        type: 'normal',
        contexts: ['selection'],
        onclick: convertOnClick
      });
    }
  
    chrome.contextMenus.create({
      title: 'Debug',
      contexts: ['page'],
      onclick: debugFunction
    });
  });
}

function createSource(){
  chrome.contextMenus.create({
    title: 'Source',
    contexts: ['page'],
    onclick: source
  });
}

chrome.storage.onChanged.addListener(function(list, sync) {
  let newlyDisabled = [];
  let newlyEnabled = [];

  var key = Object.keys(list)[0];
    
  let currentRemoved = list[key].newValue || [];
  let oldRemoved = list[key].oldValue || [];

  console.log(currentRemoved);
  console.log(oldRemoved);

  // TODO handle adding duplicates

  // currentRemoved not empty means adding option
  if (currentRemoved.length != 0){
    chrome.contextMenus.create({
      id: key,
      title: key.substring(0,3) + ' -> ' + key.substring(3,6),
      type: 'normal',
      contexts: ['selection'],
      onclick: convertOnClick
    });
  }
  
  // oldRemoved is not empty means removing option
  if (oldRemoved.length != 0){
    chrome.contextMenus.remove(key);
  }
});

function saveRatePair(base, target){
  getRatePair(base, target, function(pair, rate){
    var key = pair;
    var obj = {};
    obj[key] = rate;
    chrome.storage.sync.set(obj);
  });
}

function getRatePair(base, target, callback) {
  base = base.toUpperCase();
  target = target.toUpperCase();
  var pair = base + target;

  var request = new XMLHttpRequest();
  var url = 'https://api.exchangeratesapi.io/latest?base=' + base + '&symbols=' + target;
  request.open('GET', url, true);
  request.send();
  request.onload = function() {
    var rate = JSON.parse(this.response).rates[target];
    callback(pair, rate);
  }
}