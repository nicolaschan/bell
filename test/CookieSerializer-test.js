const assert = require('assert');

describe('CookieSerializer', function() {
    const CookieSerializer = require('../src/CookieSerializer');
    var cookieSerializer = new CookieSerializer();

    var values = {
        key1: 'val1',
        key2: 'val2'
    };

    describe('#serialize-deserialize', function() {
        var val = 'hello world';
        it('deserialize(serialize(x)) == x', function() {
            assert(cookieSerializer.deserialize(cookieSerializer.serialize(val)) == val);
        });
    });

    describe('#serializeAll', function() {
        it('serializeAll does not mutate input', function() {
            var input = {
                key: 'value'
            };
            cookieSerializer.serializeAll(input);
            assert(input['key'] == 'value');
        });

        it('deserialized value from a serialized object is original value', function() {
            var serialized = cookieSerializer.serializeAll(values);
            assert(cookieSerializer.deserialize(serialized['key1']) == values['key1']);
            assert(cookieSerializer.deserialize(serialized['key2']) == values['key2']);
        });
    });

    describe('#serializeAll-deserializeAll', function() {
        it('deserializeAll does not mutate input', function() {
            var serialized = cookieSerializer.serialize('value');
            var input = {
                key: serialized
            };
            cookieSerializer.deserializeAll(input);
            assert(input['key'] == serialized);
        });
        it('deserializeAll(serializeAll(x)) == x', function() {
            var serialized = cookieSerializer.serializeAll(values);
            var deserialized = cookieSerializer.deserializeAll(serialized);
            assert(deserialized['key1'] == values['key1']);
            assert(deserialized['key2'] == values['key2']);
        });
    });
});