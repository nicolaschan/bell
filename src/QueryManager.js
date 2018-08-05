module.exports = async function (url, cookieManager) {
  // from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  var getParameterByName = function (name, url) {
    name = name.replace(/[[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }
  // end stackoverflow

  var secretParameter = getParameterByName('secret', url)
  var enabledSecrets = cookieManager.get('secrets', [])
  if (secretParameter && enabledSecrets.indexOf(secretParameter) < 0) { enabledSecrets.push(secretParameter) }

  var removeSecretParameter = getParameterByName('rmsecret', url)
  if (removeSecretParameter && enabledSecrets.indexOf(removeSecretParameter) > -1) {
    enabledSecrets.splice(enabledSecrets.indexOf(removeSecretParameter), 1)
  }
  await cookieManager.set('secrets', enabledSecrets)

  var source = getParameterByName('source', url)
  if (source) {
    await cookieManager.set('source', source)
  }

  if (secretParameter || removeSecretParameter || source) { history.pushState(null, null, '/') }
}
