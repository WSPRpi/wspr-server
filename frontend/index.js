import App from './App'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-tagsinput/dist/bootstrap-tagsinput.css'
import 'leaflet/dist/leaflet.css'
import './app.css'

global.jQuery = require('jquery')
require('bootstrap')
require('bootstrap-tagsinput')

jQuery(document).ready(() => {
	let app = new App()
})
