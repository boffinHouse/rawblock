describe('deserialize', function () {
    it('param to deserialize', function() {
        const obj = {url: 'complicated & test = % string []', foo: '2', foo2: ['1', '3']};
        const string = rb.$.param(obj);

        expect(rb.deserialize(string)).toEqual(obj);
    });

    it('deserialize array', function() {
        const string = 'explicit[]&implicit=1&noarray=foo&implicit=2&implicit&empty&explicit2[]=[]&funny[][]=ya&really[]no=!';
        const obj = {
            explicit: [''],
            explicit2: ['[]'],
            'funny[]': ['ya'],
            implicit: ['1', '2', ''],
            noarray: 'foo',
            empty: '',
            'really[]no': '!',
        };

        expect(rb.deserialize(string)).toEqual(obj);
    });

    it('deserialize search', function() {
        const string = '?foo=1&foo2';
        const obj = {
            foo: '1',
            foo2: ''
        };

        expect(rb.deserialize(string)).toEqual(obj);
        expect(rb.deserialize('?')).toEqual({});
        expect(rb.deserialize(undefined)).toEqual({});
    });
});
