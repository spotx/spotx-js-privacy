/**
 * @fileOverview This file contains the javascript application 
 * that powers the SpotX Privacy Portal UI.
 */
"use strict";

var SxPrivacy = SxPrivacy || {};

SxPrivacy.Config = (function() {
    function Config(selectId, inputId, getDataId, anonymizeId) {
        this.selectId = selectId;
        this.inputId = inputId;
        this.getDataId = getDataId;
        this.anonymizeId = anonymizeId;
    }
    return Config;
}());

/**
 * Wraps the global instance of Handlebars so that we can inject a 
 * fake to dependent classes under test.
 */
SxPrivacy.HandlebarsWrapper = (function() {
    function HandlebarsWrapper() {
        this.handlebars = Handlebars;
    }
    return HandlebarsWrapper;
}());

/**
 * The data model for the privacy app.
 */
SxPrivacy.Model = (function() {
    function Model(rawData) {
        this.status = rawData && (rawData.status || rawData.status === 0) ? rawData.status : null;
        this.dsps = rawData && rawData.dsps ? rawData.dsps : [];
        this.dmps = rawData && rawData.dmps ? rawData.dmps : [];
        this.tags = rawData  && rawData.tags ? rawData.tags : [];
    }

    Model.prototype.isData = function() {
        return this.dsps.length > 0 || this.dmps.length > 0 || this.tags.length > 0;
    };
    return Model;
}());

/**
 * The view driver for the privacy app. I handles 
 * rendering the template to the page.
 */
SxPrivacy.ViewDriver = (function() {
    /**
     * Constructor
     * @param {string} template The handlebars template.
     * @param {HTMLElement} container The container in which to render the template.
     */
    function ViewDriver(template, container, handlebarsWrapper) {
        this.template = handlebarsWrapper.handlebars.compile(template);
        this.container = container;
        this.handlebarsWrapper = handlebarsWrapper;
        
        this.model = {
            deviceType: 0,
            deviceId: '',
            message: '',
            data: new SxPrivacy.Model()
        };

        this.registerHelpers();
    }
    /**
     * Render the template with the provided view model.
     * @param {Privacy.Model} model The view model
     */
    ViewDriver.prototype.renderWithData = function(dataModel) {
        // clear any messages
        this.model.message = '';
        if (dataModel) this.model.data = dataModel;
        this.render();
    }

    ViewDriver.prototype.renderWithMessage = function(message) {
        // clear the data model
        this.model.data = new SxPrivacy.Model();
        if (message) this.model.message = message;
        this.render();
    }

    ViewDriver.prototype.render = function() {
        this.container.innerHTML = this.template(this.model);
    }

    ViewDriver.prototype.handleDeviceChange = function(deviceType) {
        this.model.deviceType = deviceType;
        if (deviceType < 1) this.model.deviceId = '';
        this.renderWithData();
    }

    ViewDriver.prototype.handleIdChange = function(id) {
        this.model.deviceId = id;
    }

    ViewDriver.prototype.registerHelpers = function() {
        this.handlebarsWrapper.handlebars.registerHelper('ifDeviceTypeWithId', function(options) {
            if (options.data.root.deviceType > 0) {
                return options.fn(this);
            }
          });
        this.handlebarsWrapper.handlebars.registerHelper('ifData', function(options) {
            if (options.data.root.data.isData()) {
                return options.fn(this);
            }
          });
    }

    return ViewDriver;
}());

/**
 * The data service for the privacy API
 */
SxPrivacy.Service = (function() {
    /**
     * Constructor assigns values for the routes.  
     * Change here to point to production.
     */
    function Service() {
        this.nativeUrl = "http://private-25510-gdprprivacyapi.apiary-mock.com/native";
        this.foreignUrl = "http://private-25510-gdprprivacyapi.apiary-mock.com/foreign";
    }
    /**
     * Gets data for a native (cookie) ID.
     * @param {Function} successCallback 
     * @param {Function} failureCallback 
     */
    Service.prototype.getNativeData = function(successCallback, failureCallback) {
        // TODO: send all cookies
        jQuery.ajax({ 
            method: "GET",
            url: this.nativeUrl 
        })
        .done(successCallback)
        .fail(failureCallback);
    }
    /**
     * Gets data for a foreign ID.
     * @param {Function} successCallback Function to call on ajax success.
     * @param {Function} failureCallback Function to call on ajax failure.
     */
    Service.prototype.getForeignData = function(deviceType, deviceId, successCallback, failureCallback) {
        
        jQuery.ajax({ 
            method: "GET",
            url: this.foreignUrl,
            data: {
                idType: deviceType,
                idValue: deviceId
            }
        })
        .done(successCallback)
        .fail(failureCallback);
    }

    Service.prototype.anonymizeNative = function(successCallback, failureCallback) {
        //TODO: send all cookies
        jQuery.ajax({ 
            method: "GET",
            url: this.nativeUrl 
        })
        .done(successCallback)
        .fail(failureCallback);
    }

    Service.prototype.anonymizeForeign = function(deviceType, deviceId, successCallback, failureCallback) {
        
        jQuery.ajax({ 
            method: "POST",
            url: this.foreignUrl,
            contentType: "application/json",
            data: JSON.stringify({
                idType: deviceType,
                idValue: deviceId
            })
        })
        .done(successCallback)
        .fail(failureCallback);

    }

    return Service;
}());

/**
 * Main class for the privacy app.  The main entry point is Main.run.
 */
SxPrivacy.Main = (function() {
    /**
     * Constructor
     * @param {Privacy.ViewDriver} viewDriver 
     * @param {Privacy.Service} dataService 
     */
    function Main(config, viewDriver, dataService) {
        this.config = config;
        this.viewDriver = viewDriver;
        this.dataService = dataService;
    }
    /**
     * Static run function.  Constructs the app and calls
     * initialization function.
     */
    Main.run = function(config, viewDriver) {
        var privacyApp = new Main(config, viewDriver, new SxPrivacy.Service());        
        privacyApp.init();
        return privacyApp; // In case the caller needs a reference.
    }
    /**
     * Initializes the the app by calling render on the 
     * view.
     */
    Main.prototype.init = function() {
        this.viewDriver.render(new SxPrivacy.Model());
        this.registerEventHandlers();
    }

    /**
     * Register event handlers for IDs provided by the config.
     */
    Main.prototype.registerEventHandlers = function() {
        
        var selectIdDomElement = document.getElementById(this.config.selectId);
        var inputIdDomElement = document.getElementById(this.config.inputId);
        var getDataIdDomeElement = document.getElementById(this.config.getDataId);
        var anonymizeIdDomeElement = document.getElementById(this.config.anonymizeId)
        
        if (selectIdDomElement) selectIdDomElement.addEventListener("click", this.handleDeviceChange.bind(this));
        if (inputIdDomElement) inputIdDomElement.addEventListener("input", this.handleIdChange.bind(this));
        if (getDataIdDomeElement) getDataIdDomeElement.addEventListener("click", this.getData.bind(this));
        if (anonymizeIdDomeElement) anonymizeIdDomeElement.addEventListener("click", this.postAnonymize.bind(this));
    }

    Main.prototype.getData = function() {
        
        if (this.viewDriver.model.deviceType > 0) {
            this.dataService.getForeignData(
                this.viewDriver.model.deviceType, 
                this.viewDriver.model.deviceId, 
                this.readSuccessCallback.bind(this),
                this.readFailureCallback.bind(this)
            );
        } else {
            this.dataService.getNativeData(
                this.readSuccessCallback.bind(this),
                this.readFailureCallback.bind(this)
            );
        }
    }

    Main.prototype.readSuccessCallback = function(data) {
        this.viewDriver.renderWithData(new SxPrivacy.Model(data));
        this.registerEventHandlers();
    }

    Main.prototype.readFailureCallback = function() {
        var errorMessage = "There was a problem retrieving data for your audience ID. Please check your selections and try again.";
        this.viewDriver.renderWithMessage(errorMessage);
        this.registerEventHandlers();        
    }

    Main.prototype.postAnonymize = function() {
        if (this.viewDriver.model.deviceType > 0) {
            this.dataService.anonymizeForeign(
                this.viewDriver.model.deviceType, 
                this.viewDriver.model.deviceId, 
                this.postSuccessCallback.bind(this),
                this.postFailureCallback.bind(this)
            );
        } else {
            this.dataService.getNativeData(
                this.postSuccessCallback.bind(this),
                this.postFailureCallback.bind(this)
            );
        }   
    }

    Main.prototype.postSuccessCallback = function() {
        var message = "Congratulations! You are now anonymous.";
        this.viewDriver.renderWithMessage(message);
        this.registerEventHandlers();                
    }

    Main.prototype.postFailureCallback = function() {
        var errorMessage = "There was a problem anonymizing your profile. Please try again later.";
        this.viewDriver.renderWithMessage(errorMessage);
        this.registerEventHandlers();                
    }

    Main.prototype.handleDeviceChange = function(event) {
        this.viewDriver.handleDeviceChange(event.target.value);
        this.registerEventHandlers();       
    }

    Main.prototype.handleIdChange = function(event) {
        this.viewDriver.handleIdChange(event.target.value);
        this.registerEventHandlers();
    }

    return Main;
}());

try {
    module.exports = SxPrivacy;    
} catch (e) {
    //No worries, this exports the module for test.
}
