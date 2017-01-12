describe('deserialize', function () {
    it('param to deserialize', function() {
        const obj = {url: 'complicated & test = % string []', foo: '2', foo2: ['1', '3']};
        const string = rb.$.param(obj);

        expect(rb.deserialize(string)).toEqual(obj);
    });

    it('deserialize array', function() {
        const string = 'explicit[]&implicit=1&noarray=foo&implicit=2&implicit&empty';
        const obj = {
            explicit: [''],
            implicit: ['1', '2', ''],
            noarray: 'foo',
            empty: '',
        };

        expect(rb.deserialize(string)).toEqual(obj);
    });
});
