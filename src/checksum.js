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

function checksumToUint5ArrayBigInt(checksum) {
  checksum = BigInt(checksum)
  var result = new Uint8Array(8);
  for (var i = 0; i < 8; ++i) {
    result[7 - i] = Number(checksum & 31n);
    checksum = checksum >> 5n;
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

function polymodBigInt(data) {
  var GENERATOR = [0x98f2bc8e61n, 0x79b76d99e2n, 0xf33e5fb3c4n, 0xae2eabe2a8n, 0x1e4f43e470n];
  var checksum = 1n;
  for (var i = 0; i < data.length; ++i) {
    var value = BigInt(data[i]);
    var topBits = checksum >> 35n;
    checksum = ((checksum & 0x07ffffffffn) << 5n) ^ value;
    for (var j = 0n; j < 5n; ++j) {
      if (((topBits >> j) & 1n) === 1n) {
        checksum = checksum ^ GENERATOR[j];
      }
    }
  }
  return Number(checksum ^ 1n);
}

var supportsNativeBigInt = typeof BigInt === 'function';

module.exports = {
  checksumToUint5Array: supportsNativeBigInt ? checksumToUint5ArrayBigInt : checksumToUint5Array,
  polymod: supportsNativeBigInt ? polymodBigInt : polymod
};
