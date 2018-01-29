var wst = $modules["syshu.ws-tools"]
var shell = WScript.CreateObject("WScript.Shell")
var fs = WScript.CreateObject("Scripting.FileSystemObject")

var t1 = setInterval(function () {
  wst.echo("timeout1")
}, 5000)

var t2 = setInterval(function () {
  wst.echo("timeout2")
}, 5000)

var t3 = setInterval(function () {
  wst.echo("timeout3")
}, 5000)

var t4 = setTimeout(function () {
  clearInterval(t2)
}, 20000)

var i1 = setImmediate(function () {
  wst.echo("immediate1")
})