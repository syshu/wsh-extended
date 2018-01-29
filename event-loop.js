(function () {
  if (typeof $eventLoop !== "undefined" || typeof setInterval !== "undefined" || typeof setTimeout !== "undefined") { return }

  var eventLoop = [] // { id: number, execute: function, timeLeft: () => number }[]
  var id = 1
  var index = 0

  eventLoop.next = function () {
    if (index >= eventLoop.length) { index = 0 }
    var pointedEventTimeLeft = eventLoop[index].timeLeft()
    if ((typeof pointedEventTimeLeft) !== "number") {
      throw new TypeError("Event's timeLeft should return a number")
    }
    if (pointedEventTimeLeft <= 0) {
      eventLoop[index].execute()
    } else if (pointedEventTimeLeft === Infinity) {
      eventLoop.splice(index, 1)
    } else {
      index++
    }
  }

  eventLoop.isEmpty = function () {
    return !eventLoop.length
  }

  eventLoop.append = function (event) {
    eventLoop.splice(index, 0, event)
    index++
  }

  eventLoop.remove = function (id) {
    var toRemoveIndex = eventLoop.getIndexById(id)
    eventLoop.splice(toRemoveIndex, 1)
    if (toRemoveIndex < index) { index-- } // If they are equal, that is the cursored event will be removed, index will naturally point to next event.
  }

  eventLoop.loop = function () {
    while (!eventLoop.isEmpty()) {
      eventLoop.next()
    }
    // WScript.Echo("finished")
  }

  eventLoop.getIndexById = function (id) {
    var index = eventLoop.findIndex(function (event) {
      return event.id === id
    }) // Can be -1 if not found
    if (index < 0) { throw new RangeError("Given id is not exist.") }
    return index
  }

  function createImmediateEvent (callback) {
    var timeLeftAndExecute = (function () {
      var executed = false
      return [
        function () {
          if (executed) { return Infinity }
          else { return 0 }
        },
        function () {
          callback()
          executed = true
        }
      ]
    })()
    return { id: id++, timeLeft: timeLeftAndExecute[0], execute: timeLeftAndExecute[1] }
  }

  function createIntervalEvent (callback, interval) {
    var timeLeftAndExecute = (function () {
      var nextShouldExecTime = new Date().valueOf() + interval
      return [
        function () {
          var now = new Date().valueOf()
          return nextShouldExecTime - now // Could be nagative
        },
        function () {
          callback()
          nextShouldExecTime += interval
        }
      ]
    })()
    return { id: id++, timeLeft: timeLeftAndExecute[0], execute: timeLeftAndExecute[1] }
  }

  function createTimeoutEvent (callback, timeout) {
    var timeLeftAndExecute = (function () {
      var shouldExecTime = new Date().valueOf() + timeout
      var executed = false
      return [
        function () {
          if (executed) { return Infinity }
          else {
            var now = new Date().valueOf()
            return shouldExecTime - now
          }
        },
        function () {
          callback()
          executed = true
        }
      ]
    })()
    return { id: id++, timeLeft: timeLeftAndExecute[0], execute: timeLeftAndExecute[1] }
  }

  setInterval = function (callback, interval) { //TODO callback params
    if (typeof callback !== "function") { throw new TypeError("Parameter callback should be a function.") }
    if (typeof interval !== "number") { throw new TypeError("Parameter interval should be a number.") }
    if (isNaN(interval) || interval <= 0) { throw new TypeError("Parameter interval should be positive.") }
    var event = createIntervalEvent(callback, interval)
    eventLoop.append(event)
    return event.id
  }

  setTimeout = function (callback, timeout) {
    var event = createTimeoutEvent(callback, timeout || 0)
    eventLoop.append(event)
    return event.id
  }

  setImmediate = function (callback) {
    var event = createImmediateEvent(callback)
    eventLoop.append(event)
    return event.id
  }

  clearTimeout = function (id) {
    eventLoop.remove(id)
  }

  clearInterval = function (id) {
    eventLoop.remove(id)
  }

  var sleepWhenIdle = true
  if (sleepWhenIdle) {
    eventLoop.append({ // Append a manager event.
      id: 0,
      timeLeft: (function () {
        var executed = false
        return function () {
          if (executed) {
            executed = false
            return 1
          } else {
            executed = true
            return 0
          }
        }
      })(),
      execute: function () {
        var eventsTimeLeft = eventLoop.filter(function (event) {
          return event.id // Manager event's id is 0 whitch is nagative.
        }).map(function (event) {
          return event.timeLeft()
        })
        var minTimeLeft = eventsTimeLeft.reduce(function (minTimeLeft, timeLeft) {
          return Math.min(minTimeLeft, timeLeft)
        }) // Only if !isEmpty() an event will be executed.
        if (minTimeLeft > 10) { WScript.Sleep(minTimeLeft - 10) } // WScript.Sleep will take extra 5~6 secs.
      }
    })

    eventLoop.isEmpty = function () {
      return eventLoop.length <= 1 // When 1, the only 1 is the manager event.
    }
  }

  $eventLoop = { loop: eventLoop.loop }

})()