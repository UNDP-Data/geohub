import { describe, it, expect } from 'vitest';
import { parseCqlFilter } from './parseCqlFilter';
import type { FeatureCollection } from 'geojson';

// テスト用のGeoJSONデータ
const geoJsonData: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			id: 1,
			geometry: { type: 'MultiPoint', coordinates: [[30.750211060218042, -2.30839626064316]] },
			properties: {
				id: 34,
				facility_name: 'EP Rumuri',
				type_of_facility: 'Primary School',
				student_number: 714,
				staff_number: '25',
				connect_or_not: 'Connect',
				wss_id: 50530,
				condition: 'Normal',
				availability: 'Not Regularly',
				district: 'KIREHE',
				sector: 'NYAMUGARI',
				cell: 'NYAMUGARI',
				latitude: -2.3083963,
				longitude: 30.7502111
			}
		},
		{
			type: 'Feature',
			id: 2,
			geometry: { type: 'MultiPoint', coordinates: [[30.75756957103567, -2.2820901415712784]] },
			properties: {
				id: 32,
				facility_name: 'Lychee de Rusumo',
				type_of_facility: 'Secondary School',
				student_number: 701,
				staff_number: '42',
				connect_or_not: 'Connect',
				wss_id: 50532,
				condition: 'Normal',
				availability: 'Not Regularly',
				district: 'KIREHE',
				sector: 'NYAMUGARI',
				cell: 'NYAMUGARI',
				latitude: -2.2820901,
				longitude: 30.7575696
			}
		},
		{
			type: 'Feature',
			id: 3,
			geometry: { type: 'MultiPoint', coordinates: [[30.757090489837932, -2.2844122973492267]] },
			properties: {
				id: 23,
				facility_name: 'GS Rusumo',
				type_of_facility: 'Secondary School',
				student_number: 2184,
				staff_number: '93',
				connect_or_not: 'Connect',
				wss_id: 50519,
				condition: 'Normal',
				availability: 'Regularly',
				district: 'KIREHE',
				sector: 'NYAMUGARI',
				cell: 'NYAMUGARI',
				latitude: -2.2844123,
				longitude: 30.7570905
			}
		},
		{
			type: 'Feature',
			id: 4,
			geometry: { type: 'MultiPoint', coordinates: [[30.783671603104686, -2.26796484425878]] },
			properties: {
				id: 24,
				facility_name: 'EP Kazizi',
				type_of_facility: 'Primary School',
				student_number: 782,
				staff_number: '25',
				connect_or_not: 'Connect',
				wss_id: 50525,
				condition: undefined,
				availability: 'Regularly',
				district: 'KIREHE',
				sector: 'NYAMUGARI',
				cell: 'KAZIZI',
				latitude: -2.2679648,
				longitude: 30.7836716
			}
		}
	]
};

describe('parseCqlFilter', () => {
	it('should filter by EQUAL TO operator', () => {
		const result = parseCqlFilter("type_of_facility = 'Primary School'", geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by LESS THAN operator', () => {
		const result = parseCqlFilter('student_number < 714', geoJsonData.features);
		expect(result).toHaveLength(1);
	});

	it('should filter by LESS THAN OR EQUAL TO operator', () => {
		const result = parseCqlFilter('student_number <= 714', geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by GREATER THAN operator', () => {
		const result = parseCqlFilter('student_number > 782', geoJsonData.features);
		expect(result).toHaveLength(1);
	});

	it('should filter by GREATER THAN OR EQUAL TO operator', () => {
		const result = parseCqlFilter('student_number >= 782', geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by IS NULL operator', () => {
		const result = parseCqlFilter('condition IS NULL', geoJsonData.features);
		expect(result).toHaveLength(1);
	});

	it('should filter by LIKE operator', () => {
		const result = parseCqlFilter('facility_name LIKE EP', geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by IN operator with single condition', () => {
		const result = parseCqlFilter("type_of_facility IN ('Primary School')", geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by IN operator with multiple conditions', () => {
		const result = parseCqlFilter(
			"type_of_facility IN ('Primary School', 'Secondary School')",
			geoJsonData.features
		);
		expect(result).toHaveLength(4);
	});

	it('should filter by NOT IN operator with single condition', () => {
		const result = parseCqlFilter("cell NOT IN ('KAZIZI')", geoJsonData.features);
		expect(result).toHaveLength(3);
	});

	it('should filter by NOT IN operator with multiple conditions', () => {
		const result = parseCqlFilter('student_number NOT IN (701, 782)', geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should filter by BETWEEN operator', () => {
		const result = parseCqlFilter('student_number BETWEEN 600 AND 800', geoJsonData.features);
		expect(result).toHaveLength(3);
	});

	it('should filter by BETWEEN operator and EQUAL TO', () => {
		const result = parseCqlFilter(
			'student_number BETWEEN 600 AND 800 AND type_of_facility = Secondary school',
			geoJsonData.features
		);
		expect(result).toHaveLength(1);
	});

	it('should filter by NOT EQUAL TO operator', () => {
		const result = parseCqlFilter("availability <> 'Regularly'", geoJsonData.features);
		expect(result).toHaveLength(2);
	});

	it('should return an empty array when no matches', () => {
		const result = parseCqlFilter(
			"type_of_facility = 'Non-existent Facility'",
			geoJsonData.features
		);
		expect(result).toHaveLength(0);
	});
});
