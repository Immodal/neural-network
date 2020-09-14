const Utils = {
  /**
   * Returns a random integer between min and max (inclusive)
   */
  randInt: (min, max) => Math.floor(Utils.randFloat(min, max)),

  /**
   * Returns a random float between min and max (inclusive)
   */
  randFloat: (min, max) => (Math.random()) * (max - min + 1) + min,

  /**
   * Returns true if n is a number
   * https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
   */
  isNumber: n => !isNaN(parseFloat(n)) && !isNaN(n - 0)
}