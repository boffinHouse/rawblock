describe('{name}', function () {
    beforeEach(() => {

    });

    it('render {name} with default options', function(done) {
        rbTest.wait().then(()=>{
            expect(2).toEqual(2);
            done();
        });
    });
});
