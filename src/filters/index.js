function pluralize(time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

export function timeAgo(time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' minute')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' hour')
  } else {
    return pluralize(~~(between / 86400), ' day')
  }
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }

  if ((time + '').length === 10) {
    time = +time * 1000
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    date = new Date(parseInt(time))
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

export function formatTime(time, option) {
  time = +time * 1000
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

/* 数字 格式化*/
export function nFormatter(num, digits) {
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

// 金额 格式化
export function moneyFormatter(money) {
  var pattern = /(?=((?!\b)\d{3})+$)/g
  return money.toString().replace(pattern, ',')
}

export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

export function toThousandslsFilter(num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

// 数字 格式化
export function makeNumber(num) {
  if (num == '' || num == null) {
    return 0
  }
  var number = num.toString();
  var state = 0;
  if (number.indexOf('-') != -1) {
    num = number.substring(1, num.length);
    state = 1;
  }
  var result = '';
  num = Number(num.toString() || 0).toFixed(2);
  var numAry = num.toString().split(".");
  var preNum = numAry[0];
  var lastNum = numAry[1];

  while (preNum.length > 3) {
    result = ',' + preNum.slice(-3) + result;
    preNum = preNum.slice(0, preNum.length - 3);
  }
  if (preNum) {
    result = preNum + result;
  }
  result = result + "." + lastNum;
  if (state == 1) {
    result = "-" + result;
  }

  return result;
  //     money=Number(money);
  //     money=money.toFixed(2);
  //   var num = (money || 0).toString(), result = '';  
  // while (num.length > 3) {  
  //     result = ',' + num.slice(-3) + result;  
  //     num = num.slice(0, num.length - 3);  
  // }  
  // if (num) { result = num + result; }  
  // return result;  

}

export function getCookie(cookie_name) {
  var allcookies = document.cookie;
  var cookie_pos = allcookies.indexOf(cookie_name);   //索引的长度

  // 如果找到了索引，就代表cookie存在，
  // 反之，就说明不存在。
  if (cookie_pos != -1) {
    // 把cookie_pos放在值的开始，只要给值加1即可。
    cookie_pos += cookie_name.length + 1;      //这里容易出问题，所以请大家参考的时候自己好好研究一下
    var cookie_end = allcookies.indexOf(";", cookie_pos);

    if (cookie_end == -1) {
      cookie_end = allcookies.length;
    }

    var value = unescape(allcookies.substring(cookie_pos, cookie_end));         //这里就可以得到你想要的cookie的值了。。。
  }
  return value;
}
