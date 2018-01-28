(function (moduleName) {
  var crlf = '\r\n'
  function getScriptArguments () {
    if (!getScriptArguments.cache) {
      var i, result = []
      for (i = 0; i < WScript.Arguments.Count(); i++) {
        result.push(WScript.Arguments(i))
      }
      getScriptArguments.cache = result
      }
    return getScriptArguments.cache
  }
  
  function getInfo (obj, isFirstRecursion) {
    switch (typeof obj) {
      case "undefined":
      return "undefined"
      case "number":
      if (isNaN(obj)) {return "NaN"} else {return obj}
      case "string":
      if (isFirstRecursion) {
        return obj
      } else {
        return "'" + obj + "'"
      }
      case "boolean":
      if (obj) {return "true"} else {return "false"}
      case "function":
      if (isFirstRecursion) {
        return obj.toString()
      } else {
        return "[object Function]"
      }
      case "object":
      if (!obj) {
        return "null"
      } else if (Array.isArray(obj)) {
        return "[ " + obj.map(function (item) {
          return getInfo(item)
        }).join(", ") + " ]"
      } else if (obj instanceof ActiveXObject) {
        return "[object ActiveXObject]"
      } else if (Object.keys(obj).length) {
        var keys = Object.keys(obj)
        var objStr = "{ " + keys.map(function (key) {
          return key + ": " + getInfo(obj[key])
        }).join(", ") + " }"
        return objStr
      } else {
        return "{ empty }"
      }
      default:
      return "[unknown]"
    }
  }

  function _getInfo (obj) {
    return getInfo(obj, true)
  }

  function yamlize (obj, level) {
    var indentPerLv = 4
    if (!level) { level = 0 }
    var indent = ' '.repeat(indentPerLv * level)
    switch (typeof obj) {
      case "undefined":
      return "undefined"
      case "function":
      return "[object Function]"
      case "number":
      return obj
      case "string":
      if (!obj.includes('\n')) {
        return obj
      } else {
        var splitter
        if (obj.includes('\r\n')) { splitter = '\r\n' }
        else { splitter = '\n' }
        return "|" + crlf + obj.split(splitter).map(function (line) {
          return indent + line
        }).join(crlf)
      }
      case "boolean":
      return obj + ""
      case "object":
      if (!obj) {
        return "null"
      } else if (obj instanceof ActiveXObject) {
        return "[object ActiveXObject]"
      } else if (!Object.keys(obj).length) {
        return "{ empty }"
      } else if (Array.isArray(obj)) {
        return (level ? crlf : '') + 
        obj.map(function (item) {
          return indent + "- " + yamlize(item, level + 1)
        }).join(crlf)
      } else {
        var keys = Object.keys(obj)
        return (level ? crlf : '') +
        keys.map(function (key) {
          return indent + key + ': ' + yamlize(obj[key], level + 1)
        }).join(crlf)
      }
      default:
      return "[unknown]"
    }
  }
  
  function toArray (arrayLike) {
    var result = [], i
    for (i = 0; i < arrayLike.length; i++) {
      result.push(arrayLike[i])
    }
    return result
  }
  
  function echo () {
    var args = toArray(arguments)
    var toShow = args.map(function (arg) {
      return _getInfo(arg)
    }).join(crlf)
    WScript.Echo(toShow)
  }

  var popupParams = {
    TYPE_OK: 0,
    TYPE_OK_CANCEL: 1,
    TYPE_ABORT_RETRY_IGNORE: 2,
    TYPE_YES_NO_CANCEL: 3,
    TYPE_YES_NO: 4,
    TYPE_RETRY_CANCEL: 5,
    TYPE_CANCEL_TRYAGAIN_CONTINUE: 6,
    TYPE_ERROR: 16,
    TYPE_QUEST: 32,
    TYPE_WARNING: 48,
    TYPE_INFO: 64,
    CHOOSED_NONE: -1,
    CHOOSED_OK: 1,
    CHOOSED_CANCEL: 2,
    CHOOSED_ABORT: 3,
    CHOOSED_RETRY: 4,
    CHOOSED_IGNORE: 5,
    CHOOSED_YES: 6,
    CHOOSED_NO: 7,
    CHOOSED_TRYAGAIN: 10,
    CHOOSED_CONTINUE: 11
  }

  function getShell () {
    if (!getShell.instance) {
      getShell.instance = WScript.CreateObject("WScript.Shell")
    }
    return getShell.instance
  }

  function popup (message, title, type, secsToWait) {
    return getShell().Popup(message, secsToWait, title, type)
  }

  function info (message, title, secsToWait) {
    return getShell().Popup(message, secsToWait, title, 64)
  }

  function error (message, title, secsToWait) {
    return getShell().Popup(message, secsToWait, title, 16)
  }

  $modules[moduleName] = {
    getScriptArguments: getScriptArguments,
    getInfo: _getInfo,
    echo: echo,
    yamlize: function (obj) { return yamlize(obj) }
  }
})("syshu.ws-tools")