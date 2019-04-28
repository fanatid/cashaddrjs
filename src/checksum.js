/**
 * Returns an array representation of the given checksum to be encoded
 * within the address' payload.
 *
 * @private
 * @param {Number} checksum Computed checksum.
 * @returns {Uint8Array}
 */
function checksumToUint5Array(checksum) {
  var items = [checksum % 0x0100000000, (checksum / 0x0100000000) | 0];
  var result = new Uint8Array(8);
  for (var i = 0; i < 8; ++i) {
    result[7 - i] = items[0] & 0x1f;
    items[0] = (items[0] >>> 5) | ((items[1] & 0x1f) << 27);
    items[1] = items[1] >>> 5;
  }
  return result;
}

/**
 * Computes a checksum from the given input data as specified for the CashAddr
 * format: https://github.com/Bitcoin-UAHF/spec/blob/master/cashaddr.md.
 *
 * @private
 * @param {Uint8Array} data Array of 5-bit integers over which the checksum is to be computed.
 * @returns {Number}
 */
function polymod(data) {
  var GENERATOR = [
    [4072443489, 152],
    [3077413346, 121],
    [1046459332, 243],
    [783016616, 174],
    [1329849456, 30]
  ];
  var items = [1, 0];
  for (var i = 0; i < data.length; ++i) {
    var value = data[i];

    // >> 35
    var topBits = items[1] >>> 3;
    // & 0x07ffffffff
    items[1] = items[1] & 0x07;
    // << 5
    items[1] = (items[1] << 5) | (items[0] >>> 27);
    items[0] = items[0] << 5;
    // ^ value
    items[0] = items[0] ^ value;

    for (var j = 0; j < GENERATOR.length; ++j) {
      if (((topBits >>> j) & 1) === 1) {
        items[0] = items[0] ^ GENERATOR[j][0];
        items[1] = items[1] ^ GENERATOR[j][1];
      }
    }
  }
  return ((items[0] ^ 1) >>> 0) + (items[1] >>> 0) * 0x0100000000;
}

module.exports = {
  checksumToUint5Array,
  polymod
};
