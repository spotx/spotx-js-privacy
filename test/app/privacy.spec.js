const SxPrivacy = require('../../src/app/privacy');
const PrivacyMocks = require('../mocks/privacy.mocks');

describe('privacy.js unit tests', () => {
    describe('Config tests', () => {
        it('should prescribe the minimum requirements for configuring the view', () => {
            // Arrange
            // Act
            const config = new SxPrivacy.Config('selectId', 'inputId', 'getDataId', 'anonymuzeId');
            
            // Assert
            expect(config.selectId).toBeDefined();
            expect(config.inputId).toBeDefined();
            expect(config.getDataId).toBeDefined();
            expect(config.anonymizeId).toBeDefined();
        });
    });

    describe('Handlebarswrapper tests', () => {
        it('should create an instance', () => {
            // Arrange                
            window.Handlebars = jest.fn();
                
            // Act
            const wrapper = new SxPrivacy.HandlebarsWrapper();
            
            // Assert
            expect(wrapper).toBeDefined();
        });
    });

    describe('Data Model tests', () => {
        it('should assign minimum requirements of status, dsp, dmps, and tags for a model', () => {
            // Arrange
            const rawData = {
                status: 0,
                dsps: [
                    'i am a dsp'
                ],
                dmps: [
                    ' i am a dmp'
                ],
                tags: [
                    'i am a tag'
                ]
            }

            // Act
            const model = new SxPrivacy.Model(rawData);

            // Assert
            expect(model.status).toBe(rawData.status);
            expect(model.dsps).toBe(rawData.dsps);
            expect(model.dmps).toBe(rawData.dmps);
            expect(model.tags).toBe(rawData.tags);
        });

        it('should assign default values for values missing from raw data', () => {
            // Arrange
            // Act
            const model = new SxPrivacy.Model();

            // Assert
            expect(model.status).toBeNull();
            expect(model.dsps).toEqual([]);
            expect(model.dmps).toEqual([]);
            expect(model.tags).toEqual([]);
        });

        it('should have data if there are dsps', () => {
            // Arrange
            const rawData = {
                dsps: [
                    'i am a dsp'
                ]
            }

            // Act
            const model = new SxPrivacy.Model(rawData);

            // Assert
            expect(model.isData()).toBeTruthy();
        });

        it('should have data if there are dmps', () => {
            // Arrange
            const rawData = {
                dmps: [
                    'i am a dmp'
                ]
            }

            // Act
            const model = new SxPrivacy.Model(rawData);

            // Assert
            expect(model.isData()).toBeTruthy();
        });

        it('should have data if there are tags', () => {
            // Arrange
            const rawData = {
                tags: [
                    'i am a tag'
                ]
            }

            // Act
            const model = new SxPrivacy.Model(rawData);

            // Assert
            expect(model.isData()).toBeTruthy();
        });

        it('should not have data if... well... there is no data', () => {
            // Arrange
            // Act
            const model = new SxPrivacy.Model();

            // Assert
            expect(model.isData()).toBeFalsy();
        });
    });

    describe('ViewDriver tests', () => {
        
        const renderedTemplate = "rendered template";        
        let handlebarsMock;
        let templateInvocationMock;

        beforeEach(() => {
            handlebarsMock = PrivacyMocks.HandlebarsWrapperMockFactory.getMock();
            templateInvocationMock = jasmine.createSpy('template').and.returnValue(renderedTemplate);
            handlebarsMock.handlebars.compile.and.returnValue(templateInvocationMock);
        });
        
        it('should compile the Handlebars template on construction', () => {
            // Arrange
            const template = "</h1>my awesome template</h1>";
            
            // Act
            const viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);

            // Assert
            expect(handlebarsMock.handlebars.compile).toHaveBeenCalledWith(template);
        });

        it('should render to the view', () => {
            // Arrange
            const template = "</h1>my awesome template</h1>";

            const viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);

            // Act
            viewDriver.render({});

            // Assert
            expect(viewDriver.container.innerHTML).toEqual(renderedTemplate);
        });

        describe('data handling tests', () => {
            it('should bind to the model when rendering to the view', () => {
                // Arrange
                const template = "</h1>my awesome template</h1>";
                const dataModel = "my awesome model";
                const expectedModelPartial = {
                    data: dataModel
                }
    
                let templateInvocationMock = jasmine.createSpy('template');
                handlebarsMock.handlebars.compile.and.returnValue(templateInvocationMock);
    
                const viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);
    
                // Act
                viewDriver.renderWithData(dataModel);
    
                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });

            it('should safely render without data', () => {
                // Arrange
                const template = "</h1>my awesome template</h1>";
                const dataModel = "my awesome model";
                const expectedModelPartial = {
                    data: new SxPrivacy.Model()
                }
    
                const viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);
    
                // Act
                viewDriver.renderWithData();
    
                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });

            it('should clear the message when rendering with data', () => {
                // Arrange
                const template = "</h1>my awesome template</h1>";
                const renderedTemplate = "rendered template";
                const dataModel = "my awesome model";
                const expectedModelPartial = {
                    data: new SxPrivacy.Model()
                }
    
                const viewDriver = new SxPrivacy.ViewDriver(template, {}, handlebarsMock);
                viewDriver.model.message = 'this message should be cleared';

                // Act
                viewDriver.renderWithData();
    
                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });
        });

        describe('message handling', () => {
            it('should render with a message', () => {
                // Arrange
                const expectedMessage = 'the expected message';
                const expectedModelPartial = {
                    message: expectedMessage,
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
                
                // Act
                viewDriver.renderWithMessage(expectedMessage);

                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });

            it('should safely render without a message', () => {
                // Arrange
                const expectedModelPartial = {
                    message: ''
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);

                // Act
                viewDriver.renderWithMessage();

                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });
            
            it('should clear the data model when rendering a message', () => {
                // Arrange
                const expectedModelPartial = {
                    data: new SxPrivacy.Model()
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
                viewDriver.model.data = new SxPrivacy.Model({status: 0, dsps: ['someDsp'], dmp: ['someDmp'], tags: ['someTag']});

                // Act
                viewDriver.renderWithMessage();

                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });
        });

        describe('User input handling', () => {
            it('should update the device type', () => {
                // Arrange
                const expectedDeviceType = 1;
                const expectedModelPartial = {
                    deviceType: expectedDeviceType
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);

                // Act
                viewDriver.handleDeviceChange(expectedDeviceType);

                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });

            it('should reset the device ID field if the device type is not a Foreign ID type', () => {
                // Arrange
                const expectedModelPartial = {
                    deviceType: 0,
                    deviceId: ''
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
                viewDriver.model.deviceId = '1234';

                // Act
                viewDriver.handleDeviceChange(0);

                // Assert
                expect(templateInvocationMock).toHaveBeenCalledWith(jasmine.objectContaining(expectedModelPartial));
            });

            it('should update the device ID', () => {
                // Arrange
                const expectedDeviceId = '12345';

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);

                // Act
                viewDriver.handleIdChange(expectedDeviceId);

                // Assert
                expect(viewDriver.model.deviceId).toBe(expectedDeviceId);

            });
        });

        describe('handlebars helpers tests', () => {
            it('should shoe the ID field if the device type is a foreign ID', () => {
                // Arrange
                let modelMock = PrivacyMocks.modelMockFactory.getMock();
                modelMock.deviceType = 1;
                
                const options = {
                    data: {
                        root: modelMock
                    },
                    fn: jasmine.createSpy('options function')
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
                const helperCallback = handlebarsMock.handlebars.registerHelper.calls.argsFor(0)[1];

                // Act
                helperCallback(options);

                // Assert
                expect(options.fn).toHaveBeenCalled();
            });

            it('should not show the ID field if the device type is a browser', () => {
                // Arrange
                let modelMock = PrivacyMocks.modelMockFactory.getMock();
                modelMock.deviceType = 0;
                
                const options = {
                    data: {
                        root: modelMock
                    },
                    fn: jasmine.createSpy('options function')
                };

                const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
                const helperCallback = handlebarsMock.handlebars.registerHelper.calls.argsFor(0)[1];

                // Act
                helperCallback(options);

                // Assert
                expect(options.fn).not.toHaveBeenCalled();
            });
        });

        it('should show data if it exists', () => {
            // Arrange
            let modelMock = PrivacyMocks.modelMockFactory.getMock();
            modelMock.data.isData.and.returnValue(true);
            
            const options = {
                data: {
                    root: modelMock
                },
                fn: jasmine.createSpy('options function')
            };

            const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
            const helperCallback = handlebarsMock.handlebars.registerHelper.calls.argsFor(1)[1];

            // Act
            helperCallback(options);

            // Assert
            expect(options.fn).toHaveBeenCalled();
        });

        it('should not show data if it does not exist', () => {
            // Arrange
            let modelMock = PrivacyMocks.modelMockFactory.getMock();
            modelMock.data.isData.and.returnValue(false);
            
            const options = {
                data: {
                    root: modelMock
                },
                fn: jasmine.createSpy('options function')
            };

            const viewDriver = new SxPrivacy.ViewDriver('', {}, handlebarsMock);
            const helperCallback = handlebarsMock.handlebars.registerHelper.calls.argsFor(1)[1];

            // Act
            helperCallback(options);

            // Assert
            expect(options.fn).not.toHaveBeenCalled();
        });
    });

    describe('Service tests', () => {
        it('should create an instance', () => {
            // Arrange
            // Act
            const service = new SxPrivacy.Service();

            // Assert
            expect(service).toBeDefined();
        });
    });

    describe('Main tests', () => {

        let viewDriverStub;

        beforeEach(() => {
            viewDriverStub = PrivacyMocks.viewDriverMockFactory.getMock();
        });

        it('should assign a viewDriver, dataService, and viewModel properties on construction', () => {
            // Arrange
            // Act
            const main = new SxPrivacy.Main({}, {});

            // Assert
            expect(main.viewDriver).toBeDefined();
        });

        it('should initialize the view on run', () => {
            // Arrange
            // Act
            const privacyApp = SxPrivacy.Main.run({}, viewDriverStub);

            // Assert
            expect(viewDriverStub.render).toHaveBeenCalledWith(new SxPrivacy.Model());
        });
    });
});
                