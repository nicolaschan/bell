const LZUTF8 = require('lzutf8');

class Serializer {
    serialize(value) {
        return LZUTF8.compress(JSON.stringify(value), {
            outputEncoding: 'BinaryString'
        });
    }

    deserialize(value) {
        return JSON.parse(LZUTF8.decompress(value, {
            inputEncoding: 'BinaryString'
        }));
    }
}

module.exports = Serializer;