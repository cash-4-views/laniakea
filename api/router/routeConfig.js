module.exports = {

	try: {
		auth: {
			mode: "try",
			strategy: "session"
		},
		plugins: {
			"hapi-auth-cookie": {
				redirectTo: false
			}
		}
	},

	csv: {
		payload: {
			maxBytes: 100000000,
			output:'stream',
			parse: true
		}
	}

};
