// An example configuration file.
mod_config = {
	// The address of a running selenium server.
	//seleniumAddress: 'http://localhost:4444/wd/hub'

	// Capabilities to be passed to the webdriver instance.
	capabilities: {
		browserName: 'chrome'
	},

	// Spec patterns are relative to the current working directly when protractor is called.
	specs: ['specs/**/*.js'],

	// Options to be passed to Jasmine-node.
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000 // raise this value if loading times become a problem
	}
};
var mod_config;
export { mod_config as config };
