import React from 'react'
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableRowColumn,
	TableHeaderColumn
} from 'material-ui/Table'
import format from 'date-format'

class SpotTable extends React.Component {
	renderRow(row, key) {
		const renderTimestamp = ((time) => format.asString(
			'hh:mm dd/MM/yy',
			new Date(1000 * time)
		))

		return (
<TableRow key={key} selectable={false}>
	<TableRowColumn>{renderTimestamp(row.timestamp)}</TableRowColumn>
	<TableRowColumn>{row.callsign}</TableRowColumn>
	<TableRowColumn>{row.mhz}</TableRowColumn>
	<TableRowColumn>{row.snr}</TableRowColumn>
	<TableRowColumn>{row.drift}</TableRowColumn>
	<TableRowColumn>{row.grid}</TableRowColumn>
	<TableRowColumn>{row.power}</TableRowColumn>
	<TableRowColumn>{row.reporter}</TableRowColumn>
	<TableRowColumn>{row.reporter_grid}</TableRowColumn>
	<TableRowColumn>{row.km}</TableRowColumn>
	<TableRowColumn>{row.az}</TableRowColumn>
</TableRow>
		)
	}
	
	render() {
		let spots = this.props.spots.map(this.renderRow)
		return (
<Table>
	<TableHeader displaySelectAll={false}>
		<TableRow>
			<TableHeaderColumn>Time</TableHeaderColumn>
			<TableHeaderColumn>Callsign</TableHeaderColumn>
			<TableHeaderColumn>MHz</TableHeaderColumn>
			<TableHeaderColumn>Signal/Noise</TableHeaderColumn>
			<TableHeaderColumn>Drift</TableHeaderColumn>
			<TableHeaderColumn>Grid</TableHeaderColumn>
			<TableHeaderColumn>Power</TableHeaderColumn>
			<TableHeaderColumn>Reporter</TableHeaderColumn>
			<TableHeaderColumn>Reporter Grid</TableHeaderColumn>
			<TableHeaderColumn>Kilometres</TableHeaderColumn>
			<TableHeaderColumn>Azimuth</TableHeaderColumn>
		</TableRow>
	</TableHeader>
	<TableBody preScanRows={false} displayRowCheckbox={false}>
		{spots}
	</TableBody>
</Table>
		)
	}
}

export default SpotTable
