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
        var serialized = {};
        for (var key in obj)
            serialized[key] = this.serialize(obj[key]);
        return serialized;
    }

    deserializeAll(obj) {
        var deserialized = {};
        for (var key in obj)
            deserialized[key] = this.deserialize(obj[key])
        return deserialized;
    }
}

module.exports = Serializer;