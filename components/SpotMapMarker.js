import React from 'react'
import {CRS, icon as create_icon} from 'leaflet'
import {Marker, Popup} from 'react-leaflet'
import MaidenHead from 'maidenhead'

function makeIcon(url) {
	//magic numbers to match the size of the current icon
	//suggestions welcome
	return create_icon({
		iconUrl: url,
		iconSize: [25, 41],
		iconAnchor: [12, 40],
		popupAnchor: [0, -40]
	});
}

class SpotMapMarker extends React.Component {
	render() {
		const icon_home = makeIcon(require('./marker-home.png'));
		const icon_us = makeIcon(require('./marker-us.png'));
		const icon_them = makeIcon(require('./marker-them.png'));

		let key = this.props.key;
		let spot = this.props.spot;
		let home = this.props.home;
		let location = spot.us ? spot.grid : spot.reporter_grid;
		let icon = spot.us ? icon_us : icon_them;
		let popup = (
<Popup>
	<p>{spot.reporter} received {spot.callsign}</p>
</Popup>
		);

		if(home) {
			location = spot.us ? spot.reporter_grid : spot.grid;
			icon = icon_home;
			popup = (
<Popup>
	<p>{spot.us ? spot.reporter : spot.callsign} QTH</p>
</Popup>
			);
		}

		return (
<Marker key={key} position={MaidenHead.toLatLon(location)} icon={icon}>
	{popup}
</Marker>
		);
	}
}

export default SpotMapMarker
