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

    serializeAll(obj) {
        for (var key in obj)
            obj[key] = this.serialize(obj[key]);
        return obj;
    }

    deserializeAll(obj) {
        for (var key in obj)
            obj[key] = this.deserialize(obj[key])
        return obj;
    }
}

module.exports = Serializer;