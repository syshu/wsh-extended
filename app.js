var wst = $modules["syshu.ws-tools"]
var shell = WScript.CreateObject("WScript.Shell")
var fs = WScript.CreateObject("Scripting.FileSystemObject")

function getImageSize(info) {
  return new RegExp("\\bOutput:\\s+(\\d*\\s+bytes)").exec(info)[1]
}

var sizeObj = {}
var quality = 85
var sizes = wst.getScriptArguments().map(function (target) {
  return "cwebp -q " + quality + " " + target + " -o " + fs.GetParentFolderName(target) + "/" + fs.GetBaseName(target) + "." + quality + ".webp"
}).map(function (cmd) {
  return shell.Exec(cmd)
}).map(function (exec) {
  return exec.StdErr.ReadAll()
}).map(getImageSize)
wst.getScriptArguments().forEach(function (target, index) {
  sizeObj[fs.GetFileName(target)] = sizes[index]
})
wst.echo(wst.yamlize({'Parse succeed': '', quality: quality, 'Each picture has been zipped in size of': sizeObj}))