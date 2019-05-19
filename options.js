function createSelect(id) {
  var currencies = getCurrencies();
  var select = document.getElementById(id);

  currencies.forEach(element => {
    let option = document.createElement('option');
    option.value = element;
    option.innerHTML = element;
    select.appendChild(option);
  });

  select[0].selected = 1;
}

function createAllSelect(){
  chrome.storage.sync.get(null, function(result){
    var select = document.getElementById('allPairs');

    // TODO find better way 
    // Remove possible old children
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }

    for (let key of Object.keys(result)) {
      let option = document.createElement('option');
      option.value = key;
      option.innerHTML = key.substring(0,3) + ' -> ' + key.substring(3,6);
      select.appendChild(option);
    }
  });
}

createSelect('selectBase');
createSelect('selectTarget');
createAllSelect();

document.getElementById('removePair').onclick = function(){
  var select = document.getElementById('allPairs');
  var toRemove = select[select.selectedIndex];

  if (toRemove == undefined){
    return;
    //throw error
  }

  var value = toRemove.value;

  // TODO find different way to update list - bad for long lists
  chrome.storage.sync.remove(value, function(){
    createAllSelect();
  });
}

document.getElementById('addPair').onclick = function(){
  var list1 = document.getElementById('selectBase');
  var list2 = document.getElementById('selectTarget');

  var base = list1.options[list1.selectedIndex].text;
  var target = list2.options[list2.selectedIndex].text;

  if (target == undefined || base == undefined || base == target){
    return;
  }
  
  saveRatePair(base, target);
}

function saveRatePair(base, target){
  getRatePair(base, target, function(pair, rate){
    var key = pair;
    var obj = {};
    obj[key] = rate;
    chrome.storage.sync.set(obj, function(){
      createAllSelect();
    });
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