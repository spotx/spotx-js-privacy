var Handlebars = {};

var HandlebarsWrapperMockFactory = (function() {
    return {
        getMock: function() {
            return {
                handlebars: {
                    compile: jasmine.createSpy('compile'),
                    registerHelper: jasmine.createSpy('registerHelper')
                }
            }
        }
    }
})();

var viewDriverMockFactory = (function () {
    return {
        getMock: function() {
            return {
                render: jasmine.createSpy('render')
            }
        }
    }
})();

module.exports = {
    HandlebarsWrapperMockFactory,
    viewDriverMockFactory
}