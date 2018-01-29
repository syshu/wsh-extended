(function () {
  if (typeof $eventLoop !== "undefined" || typeof setInterval !== "undefined" || typeof setTimeout !== "undefined") { return }

  var eventLoop = [] // { id: number, callback: function, timeLeft: () => number }[]
  var id = 0
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
    var event = createIntervalEvent(callback, interval)
    eventLoop.append(event)
    return event.id
  }

  setTimeout = function (callback, timeout) {
    var event = createTimeoutEvent(callback, timeout)
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

  $eventLoop = { loop: eventLoop.loop }

})()