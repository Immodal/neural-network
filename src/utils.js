const Utils = {
  /**
   * Returns true if n is a number
   * https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
   */
  isNumber: n => !isNaN(parseFloat(n)) && !isNaN(n - 0)
}