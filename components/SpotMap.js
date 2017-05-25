import React from 'react'
import {Map, ImageOverlay, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import SpotMapMarker from './SpotMapMarker'

class SpotMap extends React.Component {
	render() {
		const bounds = [[-90, -180], [90, 180]];
		let results = this.props.results;

		let markers = results.map((spot, key) =>
<SpotMapMarker key={key + 1} spot={spot} home={false}/>
		);
		if(results.length != 0) {
			markers.push(
<SpotMapMarker key={0} spot={results[0]} home={true}/>
			);
		}

		let online = (
<TileLayer url={'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}/>
		);
		let offline = (
<ImageOverlay url='/static/map.png' bounds={bounds}/>
		);

		let map = navigator.onLine ? online : offline;
		return (
<Map style={{height: '480px'}} animate={true} bounds={bounds} maxBounds={bounds} ref={map => this.map = map}>
	{map}
	{markers}
</Map>
		)
	}

	// problem: bootstrap tabs don't report size correctly
	// hack: redraw the map when the tab is selected
	redraw() {
		let ref = this.map.state.map;
		ref.invalidateSize();
		ref.setZoom(1);
	}
}

export default SpotMap
