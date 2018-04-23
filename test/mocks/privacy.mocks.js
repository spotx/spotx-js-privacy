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

var modelMockFactory = (function () {
    return {
        getMock: function() {
            return {
                data: {
                    isData: jasmine.createSpy('isData')
                }
            }
        }
    }
})();

module.exports = {
    HandlebarsWrapperMockFactory,
    viewDriverMockFactory,
    modelMockFactory
}