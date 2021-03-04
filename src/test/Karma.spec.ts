describe('window', function () {
    it('is defined', function () {
        expect(typeof window).toBe('object');
    });
    
    it('contains jasmine', function () {
        expect(typeof jasmine).toBe('object');
    });
});

