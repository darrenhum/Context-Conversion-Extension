const currencies = {
    'AUD': 'Australian dollar',
    'BGN': 'Bulgarian lev',
    'BRL': 'Brazilian real',
    'CAD': 'Canadian dollar',
    'CHF': 'Swiss franc',
    'CNY': 'Chinese yuan renminbi',
    'CZK': 'Czech koruna',
    'DKK': 'Danish krone',
    'EUR': 'Euro',
    'GBP': 'Pound sterling',
    'HKD': 'Hong Kong dollar',
    'HRK': 'Croatian kuna',
    'HUF': 'Hungarian forint',
    'IDR': 'Indonesian rupiah',
    'ILS': 'Israeli shekel',
    'INR': 'Indian rupee',
    'ISK': 'Icelandic krona',
    'JPY': 'Japanese Yen',
    'KRW': 'South Korean won',
    'MXN': 'Mexican peso',
    'MYR': 'Malaysian ringgit',
    'NOK': 'Norwegian krone',
    'NZD': 'New Zealand dollar',
    'PHP': 'Philippine peso',
    'PLN': 'Polish zloty',
    'RON': 'Romanian leu',
    'RUB': 'Russian rouble',
    'SEK': 'Swedish krona',
    'SGD': 'Singapore dollar',
    'THB': 'Thai baht',
    'TRY': 'Turkish lira',
    'USD': 'US Dollar',
    'ZAR': 'South African rand',
  };
  
  function getCurrencies(){
    var result = [];
    for (let key of Object.keys(currencies)) {
      result.push(key);
    }
    return result;
  }