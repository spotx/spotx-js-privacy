const SxPrivacy = require('../../src/app/privacy');
const PrivacyMocks = require('../mocks/privacy.mocks');

describe('privacy.js unit tests', function() {
    it('should fail', () => {
        expect(true).toBeFalsy();
    });

    describe('Model tests', function() {
        it('should create an instance', function() {
            // Arrange
            // Act
            var model = new SxPrivacy.Model();

            // Assert
            expect(model).toBeDefined();
        });
    });

    describe('ViewDriver tests', function() {
        
        var handlebarsMock;

        beforeEach(function() {
            handlebarsMock = PrivacyMocks.HandlebarsWrapperMockFactory.getMock();
        });
        
        it('should compile the Handlebars template on construction', function() {
            // Arrange
            var template = "</h1>my awesome template</h1>";
            
            // Act
            var viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);

            // Assert
            expect(handlebarsMock.handlebars.compile).toHaveBeenCalledWith(template);
        });

        it('should render to the view', function() {
            // Arrange
            var template = "</h1>my awesome template</h1>";
            var renderedTemplate = "rendered template";

            var templateInvocationMock = jasmine.createSpy('template').and.returnValue(renderedTemplate);
            handlebarsMock.handlebars.compile.and.returnValue(templateInvocationMock);

            var viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);

            // Act
            viewDriver.render({});

            // Assert
            expect(viewDriver.container.innerHTML).toEqual(renderedTemplate);
        });

        it('should bind to the model when rendering to the view', () => {
            // Arrange
            const template = "</h1>my awesome template</h1>";
            const renderedTemplate = "rendered template";
            const dataModel = "my awesome model";
            const expectedModelPartial = {
                data: dataModel
            }

            var templateInvocationMock = jasmine.createSpy('template');
            handlebarsMock.handlebars.compile.and.returnValue(templateInvocationMock);

            var viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);

            // Act
            viewDriver.renderWithData(dataModel);

            // Assert
            expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
        });
    });

    describe('Service tests', function() {
        it('should create an instance', function() {
            // Arrange
            // Act
            var service = new SxPrivacy.Service();

            // Assert
            expect(service).toBeDefined();
        });
    });

    describe('Main tests', function() {

        var viewDriverStub;

        beforeEach(function() {
            viewDriverStub = PrivacyMocks.viewDriverMockFactory.getMock();
        });

        it('should assign a viewDriver, dataService, and viewModel properties on construction', function() {
            // Arrange
            // Act
            var main = new SxPrivacy.Main({}, {});

            // Assert
            expect(main.viewDriver).toBeDefined();
        });

        it('should initialize the view on run', function() {
            // Arrange
            // Act
            var privacyApp = SxPrivacy.Main.run({}, viewDriverStub);

            // Assert
            expect(viewDriverStub.render).toHaveBeenCalledWith(new SxPrivacy.Model());
        });
    });
});
