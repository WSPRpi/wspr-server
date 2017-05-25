import React from 'react'
import format from 'date-format'
import {Popup} from 'react-leaflet'

class SpotMapMarkerPopup extends React.Component {
	render() {
                const renderTimestamp = ((time) => format.asString(
                        'dd/MM/yy',
                        new Date(1000 * time)
                ))

		let spot = this.props.spot;
		return (
<Popup>
	<p>{spot.reporter} received {spot.callsign}, {renderTimestamp(spot.timestamp)}</p>
</Popup>
		);
	}
}

export default SpotMapMarkerPopup
