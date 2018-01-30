var wst = $modules["syshu.ws-tools"]
var shell = WScript.CreateObject("WScript.Shell")
var fs = WScript.CreateObject("Scripting.FileSystemObject")

new Promise(function (ret, thr) {
  setTimeout(function () {
    ret(10)
  }, 5000)
}).then(function (num) {
  wst.echo(num)
})