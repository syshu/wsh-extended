var wst = $modules["syshu.ws-tools"]
var shell = WScript.CreateObject("WScript.Shell")
var fs = WScript.CreateObject("Scripting.FileSystemObject")

var t1 = setInterval(function () {
  wst.echo("interval1")
}, 5000)

var t2 = setInterval(function () {
  wst.echo("interval2")
}, 5000)

var t3 = setInterval(function () {
  wst.echo("interval3")
}, 5000)

var t4 = setTimeout(function () {
  clearInterval(t2)
}, 15000)

var i1 = setImmediate(function () {
  wst.echo("immediate1")
})

var t5 = setTimeout(function () {
  clearInterval(t1)
  clearInterval(t3)
}, 30000)