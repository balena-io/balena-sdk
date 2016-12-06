fs = require('fs')
path = require('path')

exports.loadEnv = ->
	envPath = path.join(__dirname, '..', '.env')
	try
		fs.accessSync(envPath, fs.constants.R_OK)
	catch
		return

	fs.readFileSync(envPath, 'utf8')
		.split(/\n+/)
		.filter (s) -> !!s
		.forEach (s) ->
			i = s.indexOf('=')
			if i < 0
				throw new Error('The .env file looks malformed, key and value must be separated with =')
			key = s.substring(0, i)
			value = s.substring(i + 1)
			console.log("Setting env: #{key}=#{value}")
			process.env[key] = value
