import { describe, it, expect, beforeEach } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import PropertySelect from './PropertySelect.svelte';
import type { VectorTileMetadata } from '$lib/interfaces/VectorTileMetadata.js';

const layer = {
	id: 'e078c8ff-2838-4c2f-b8c0-12793355f8ee',
	name: 'water facilities in Rwanda',
	format: 'pbf',
	center: '30.54567511734848,-2.018420014318109,0',
	bounds: '30.23180824865354,-2.3889401481334303,30.859541986043425,-1.6478998805027874',
	minzoom: 0,
	maxzoom: 22,
	json: {
		vector_layers: [
			{
				id: 'rwanda.water_facilities',
				fields: {
					wsf_code: 'varchar. ',
					wsf_type: 'varchar. ',
					wsf_name: 'varchar. ',
					altitude: 'int4. ',
					serv_area_villages: 'varchar. ',
					serv_popu_personals: 'int4. ',
					serv_popu_households: 'int4. ',
					type_water_source: 'varchar. ',
					no_water_source: 'int4. ',
					hand_pump_type_name: 'varchar. ',
					year_construction: 'int4. ',
					fund: 'varchar. ',
					status: 'int4. ',
					observation: 'varchar. ',
					dist_id: 'int4. ',
					id: 'int4. '
				},
				minzoom: 0,
				maxzoom: 22
			}
		],
		tilestats: {
			layerCount: 1,
			layers: [
				{
					layer: 'rwanda.water_facilities',
					geometry: 'Point',
					count: 768,
					attributeCount: 16,
					attributes: [
						{
							attribute: 'serv_popu_personals',
							type: 'number',
							count: 761,
							min: 100,
							max: 14400,
							mean: 1586.3810775295663,
							median: 1225,
							std: 1320.2311597273997,
							histogram: {
								count: [672, 80, 7, 1, 1],
								bins: [100, 2960, 5820, 8680, 11540, 14400]
							}
						},
						{
							attribute: 'serv_popu_households',
							type: 'number',
							count: 764,
							min: 20,
							max: 13750,
							mean: 355.9149214659686,
							median: 278,
							std: 553.1664663924842,
							histogram: {
								count: [763, 0, 0, 0, 1],
								bins: [20, 2766, 5512, 8258, 11004, 13750]
							}
						},
						{
							attribute: 'type_water_source',
							type: 'string',
							count: 768,
							values: ['Borehole', 'Spring', 'dug well']
						},
						{
							attribute: 'year_construction',
							type: 'number',
							count: 311,
							min: 1927,
							max: 2015,
							mean: 2000.887459807074,
							median: 2004,
							std: 14.13815029801232,
							histogram: {
								count: [1, 4, 15, 79, 212],
								bins: [
									1927, 1944.6, 1962.1999999999998, 1979.7999999999997, 1997.3999999999996,
									2014.9999999999995
								]
							}
						},
						{
							attribute: 'fund',
							type: 'string',
							count: 190,
							values: [
								'Community',
								'DICO',
								'ENERES',
								'Private Funder',
								'LWF',
								'AEE',
								'USAID',
								'NPD COTRACO',
								'CARE',
								'UBUDEHE',
								'CCF',
								'District',
								'Belgian',
								'UNHCR',
								'JICA',
								'Ubudehe',
								'UNICEF',
								'Government',
								'Baptist church',
								'PHAS COFORWA',
								'KODAM',
								'Cell',
								'COFORWA',
								'PNAS-COFORWA',
								'UBIRI',
								'Sector',
								'Volonteers of Guilde in partnership with Humura organization',
								'MINAGRI',
								'Kabera Elaste',
								'former ELECTROGAZ (new WASAC)',
								'Chinese company',
								'Piped schemes project',
								'FXB',
								'COOGERWA',
								'INADES FORMATION RWANDA',
								'Italian funders of "Munyaga health center"'
							]
						},
						{
							attribute: 'altitude',
							type: 'number',
							count: 768,
							min: 1296,
							max: 7372,
							mean: 1439.6315104166667,
							median: 1411.5,
							std: 230.84094525126088,
							histogram: {
								count: [767, 0, 0, 0, 1],
								bins: [
									1296, 2511.2, 3726.3999999999996, 4941.599999999999, 6156.799999999999,
									7371.999999999999
								]
							}
						},
						{
							attribute: 'serv_area_villages',
							type: 'string',
							count: 768,
							values: [
								'Ruseke',
								'Akimpala, Video',
								'Video, Akabahizi',
								'Nyabombe, Gisenga, Musingi, Juru',
								'Nyabombe, Gisenga, Musimbi, juru',
								'Akamuyenzi, Fawe Girls School',
								'Gisenga, Umusimbi, Juru1, Juru2',
								'Kabeza',
								'Mirambi 3, Mirambi 2, Kidogo, Gitega',
								'Rukore, Miyaga',
								'Mirambi 3, Mirambi 2, Kidogo',
								'Kidogo, Gakenyeri, Gitega',
								'Nyakabungo, Nyagahandagaza, Gitega',
								'Nyabugogo, Mikinga, Kimana, Nyamiyaga, Nyakabungo',
								'Miyaga, Gakoma 1, Rwinyana, Buhabwa',
								'Nyamiyaga',
								'Karagari 1, Akabare1, Akabare2, Cyinunga1',
								'Akabare 1, Akabare 2, Cyinunga 1',
								'Gakenyeri, Rwemasha, Nyakagarama, Nyamarebe',
								'Nyamirama, Akimana, Kayongo',
								'Mirambi 2, Cyinunga 2, 2 villages from Rubona cell',
								'Mirambi 3, Cyinunga2, 4 villages from Gakenke cell',
								'Karagari 1, Akabare 1, Akabare 2, Cyinunga 1',
								'Karagari 1, Akabare 1, Akabare 2',
								'Rwisirabo 2',
								'Kayongo, Macuba, Nyamirama, Akamina',
								'Rwakabanda',
								'Sabasengo',
								'Kayongo, Macuba',
								'Nyanga',
								'Nyabuganda, Ubwiza, Ryamanyoni, Kayongo, Macuba',
								'Rwinyambo, Rwakabanda',
								'Rucaca, Nyabugando, Akanyerezo',
								'Nyanga, Macuba, Rucaca',
								'Akanyerezo, Ryamanyoni, Ubwiza',
								'Nyabugogo, Mikinga, Nyakabungo, Kamudongo, Kimana, Akabare, Nyamiyaga',
								'Nyakabungo, Nyagahandagaza, Gitega, Nyirampaca',
								'Karambi, Akabuga, Kiyovu, Nyamirama, Rukoyoyo',
								'Akamina, Nyamirama, Cyinyana, karambi',
								'Kiyovu, Karambi, Rwisheke',
								'Akabuga, Nyagashanga, Rugunga, Nyamirama',
								'Ngumeri1, Ngumeri2, Cyinyana',
								'Kabuga, Buyonza, Ryakirenzi1, Ryakirenzi2, Buyanja',
								'Rwazana, Migera',
								'Rumuri, Rushenyi, Rebero, Matunguru, Rwisheke1',
								'Rwasama, Karambi, Kiyovu, Nyamirama',
								'Akamina, Cyinyana',
								'Rushenyi, Kabana, Rwisheke1, Rwisheke2',
								'Nyabugogo, Juru, Mikinga, Ikimana, Miyaga, Uruhuha, Nyamiyaga',
								'Nyabugogo, Juru, Isoko, Gisenga, Kamudongo, Miyaga, Uruhuha, Musimbi, Akabare, Nyamiyaga',
								'Rwazana',
								'Taba, Kacyiru, Kabeza, Gitoki, Rukoma',
								'Rugeyo',
								'Only for this public school',
								'Rwisirabo 1',
								'Butimba1',
								'Butimba',
								'Rwakabanda, Kaneke, Kigobe',
								'Karambo2, Kamajigija, Karambo1',
								'Karama',
								'Mumuri, Kigwene',
								'Cyamburara, Murundi, Buhabwa',
								'Akamina, Nyamirama, Akabuga, Rugunga',
								'Miyaga',
								'Buhabwa, Cyambarara',
								'Kaneke, Miyaga, Rwakabanda, Buhabwa',
								'Murundi, Buhabwa, Cyamburara',
								'Buhabwa, Miyaga, Murundi',
								'Kabana, Rushenyi, Rwisheke1, Rwisheke2',
								'Rugunga, Ngumeri1, Ngumeri2, Nyagashanga, Cyinyana',
								'Rwakabanda, Rwinyambo',
								'Rwakabanda, Cyandorimana',
								'Nyagashanga, Mucyinunga, Akabuga',
								'Cyinyana, Kabeza, Cyamburara',
								'Abisunganye, Gatebe, Gasogororo, Abemeyamahoro, Amizero',
								'Musenyi',
								'Property of the school during class days and by Gasogororo and Amizero village during hollidays',
								'Nyagatovu, Karambarara, Karwiru, Kinyemera',
								'Gikumba, Rugendabari, Kanyamasha',
								'Amizero, Iragwe, Gasogororo, Abisunganye',
								'Mburabuturo, Kinunga',
								'Gikumba, Rugendabari, Kanyamasha, Cyeru',
								'karambarara, Akarweru, Byimana, Indatwa, Nyagatovu',
								'Cyeru',
								'Miyange, Munazi, Kabungo',
								'Buhoro',
								'Karambo',
								'Agasharu, Buhoro',
								'Agasharu',
								'Kabarima',
								'Cyabitana',
								'Murambi, Amashya',
								'Agasharu, nyakagarama',
								'Gasharu, Gasogi',
								'Murambi, Agasharu, Agatare, Amashya',
								'Karambi, Cyinkoronko',
								'Kabarima, Karambo, Gitega',
								'Gitega, Karambo, Rugina',
								'Akamukire',
								'Akabuye, Kacyiru, Kamukire'
							]
						},
						{
							attribute: 'no_water_source',
							type: 'number',
							count: 768,
							min: 1,
							max: 1,
							mean: 1,
							median: 1,
							std: 0,
							values: [1]
						},
						{
							attribute: 'hand_pump_type_name',
							type: 'string',
							count: 155,
							values: ['Other', 'Afridev', 'India Mark II', 'India Mark III']
						},
						{
							attribute: 'dist_id',
							type: 'number',
							count: 768,
							min: 51,
							max: 56,
							mean: 54.205729166666664,
							median: 54,
							std: 1.7812198593407484,
							values: [51, 54, 55, 56]
						},
						{
							attribute: 'wsf_code',
							type: 'string',
							count: 768,
							values: [
								'HP-E-231',
								'HP-E-037',
								'HP-E-036',
								'HP-E-039',
								'HP-E-038',
								'HP-E-041',
								'HP-E-040',
								'HP-E-042',
								'HP-E-053',
								'HP-E-052',
								'HP-E-055',
								'HP-E-054',
								'HP-E-049',
								'HP-E-048',
								'HP-E-051',
								'HP-E-050',
								'HP-E-061',
								'HP-E-060',
								'HP-E-063',
								'HP-E-080',
								'HP-E-062',
								'HP-E-057',
								'HP-E-056',
								'HP-E-059',
								'HP-E-058',
								'HP-E-132',
								'HP-E-131',
								'HP-E-134',
								'HP-E-133',
								'HP-E-128',
								'HP-E-130',
								'HP-E-129',
								'HP-E-136',
								'HP-E-135',
								'IS-E-341',
								'IS-E-340',
								'IS-E-343',
								'IS-E-342',
								'IS-E-339',
								'IS-E-317',
								'IS-E-318',
								'IS-E-325',
								'IS-E-324',
								'IS-E-327',
								'IS-E-326',
								'IS-E-323',
								'IS-E-322',
								'IS-E-332',
								'IS-E-329',
								'IS-E-328',
								'IS-E-331',
								'IS-E-330',
								'IS-E-301',
								'IS-E-300',
								'IS-E-299',
								'HP-E-118',
								'IS-E-387',
								'HP-E-125',
								'HP-E-124',
								'HP-E-127',
								'HP-E-126',
								'HP-E-123',
								'HP-E-069',
								'HP-E-068',
								'HP-E-071',
								'HP-E-070',
								'HP-E-065',
								'HP-E-064',
								'HP-E-067',
								'HP-E-066',
								'HP-E-077',
								'HP-E-076',
								'HP-E-079',
								'HP-E-078',
								'HP-E-073',
								'HP-E-072',
								'HP-E-075',
								'HP-E-074',
								'HP-E-085',
								'HP-E-084',
								'HP-E-087',
								'HP-E-086',
								'HP-E-081',
								'HP-E-083',
								'HP-E-082',
								'HP-E-033',
								'IS-E-354',
								'HP-E-032',
								'HP-E-035',
								'HP-E-034',
								'HP-E-045',
								'HP-E-044',
								'HP-E-047',
								'HP-E-046',
								'HP-E-029',
								'HP-E-031',
								'HP-E-030',
								'HP-E-148',
								'HP-E-147',
								'HP-E-150'
							]
						},
						{
							attribute: 'wsf_type',
							type: 'string',
							count: 768,
							values: ['Hand Pump', 'Improved Spring']
						},
						{
							attribute: 'wsf_name',
							type: 'string',
							count: 768,
							values: [
								'Ruseke',
								'Kaminuza',
								'Video',
								'Kwa Misago',
								'Nayikondo',
								'Fawe',
								'Gisenga',
								'Gashogoshogo',
								'Buriba',
								'Rukore',
								'Rwamuyoboke',
								'Kidogo',
								'Kibombwe',
								'Rwakigarama',
								'Gakoma 1',
								'Mugiperefe',
								'Kayanga',
								'Gakenyeri',
								'Kwa Gahizi',
								'Mirambi 2',
								'Kagende',
								'Sodoma',
								'Rwisirabo 2',
								'Bikoki',
								'Kwa Nyirazibera',
								'Rwakabanda',
								'Sabasengo 1',
								'Sabasengo 3',
								'Sabasengo 2',
								'Kayongo',
								'Nyanga',
								'Akaruruma',
								'Rwinyambo',
								'Rucaca',
								'Akanyerezo',
								'Gisagara',
								'Akimana',
								'Gatoki',
								'Ngumeri1',
								'Ryakiramba',
								'Rwazana',
								'Cyahafi',
								'Kwa Mutabazi',
								'Kabana',
								'Nyabombe',
								'Kwa Kanimba',
								'Ku ruganda',
								'Nayikondo ya Rwazana',
								'Gitoki',
								'Rugeyo 3',
								'Rugeyo 2',
								'Rwisirabo ku ishuri',
								'Rwisirabo 1',
								'Rugeyo 1',
								'Butimba1',
								'Nyakambu',
								'Nayikondo ya Buseruka',
								'Rwakinyagiro',
								'Mumuri',
								'Cyamburara',
								'Kwa Mureramanzi',
								'Kwa Siriro',
								'Kwa Mwitaba',
								'Kwa Gerevase',
								'Buhabwa',
								'Rugunga',
								'Cyipyisi',
								'Gitunga',
								'Gihuru',
								'Cyinyana',
								'Gasogororo',
								'Nyakariba',
								'Saint Louis Kayonza Vocational school',
								'Mukarange Health center',
								'Nyagatovu',
								'Nayikondo ya gikumba',
								'Nayikondo yo mu mizero',
								"Nayikondo y'I Mburabuturo",
								'Nayikondo 2 ya Gikumba',
								'Nayikondo yo kuri green',
								'EAR Kayonza',
								'Miyange',
								'Rwanyakaryugu',
								'Cyemo',
								'Rwamurekwe',
								'Ku mbuga ya Bugambira',
								'Kabarima',
								'Cyabitana',
								'Murambi',
								'Gashuhe',
								'Rwasagahara',
								'Kwa Gatanazi 1',
								'Kabakene',
								'Rwamurama',
								'Rwanyakagabo',
								'Kanyeganyege',
								'Rwamurinzi',
								'Murutaka',
								'Rwanyakajyugu',
								'Kashobore'
							]
						},
						{
							attribute: 'observation',
							type: 'string',
							count: 767,
							values: [
								'They wish to have a new hand pump.',
								'They report that hand pumps are used by many people and it may be the reason why they get easly broken. Maybe if they can have further trainings on O&M, it may help  them to protect the pumps.',
								'They are keeping some spare parts that were stolen at village level. They are willing to participate into trainings on O&M, and also financial contribution on rehabilitation and extension of the facility.',
								'they are asking support and help for repairement and they shall contribute if there is committee to manage',
								'The fact that the facility is located at the health center gives it a way to have proper protection and perfect maintanance.',
								'they need training on how to repair handpump and also the committee to manage is very needed and they are able to contribute for O&M like 300rwf/HH quartely',
								"they don't need the repairement because they can't access, they only suggest new construction of water supply nearby",
								'they need regular training on O&M of handpump and the water committee is needed',
								'they need regular training on O&M of handpump and also the water committee is needed',
								'they need regular training on O&M of the handpump',
								'willingness to contribute for O&M if the handpump repaired and they are able to contribute 500rwf/HH per year, it could be better if someone give support of repairement, regular training of O&M for handpumps',
								'willingness to contribute for O&M if the handpump repaired and they are able to contribute 500rwf/HH per year, it could be better if someone give support of repairement because people fetch water very far from where they live',
								'regular trainings for O&M of handpumps is needed, construction of watering animals is also needed',
								'they need regular training on O&M of handpump and also the water committee is needed, people shall contribute for O&M like 500rwf/HH per year if the handpump is repaired',
								'the explaination and mobilization on importance of O&M of water facility to citizen is really needed',
								'they need water committee to manage the handpump, regular training for O&M of handpump is also needed',
								'regular trainings for O&M of handpumps is needed',
								'they want regular training for O&M of handpump',
								'they want new handpump near their households as this one is located far from where they live',
								'The pH of this hand pump is really high (10.02) with a high concentration of fluor (1.5<F<3.0). Teeth of the kids in this village are brownish almost as dark chocolate.',
								'They are in need of help to get clean water',
								'they need any support to repair the handpump because people are suffering to get clean water',
								'it could be better for them if they get water pipeline near their houses and there are able to contribute for O&M',
								"They don't have any other alternative than buying water from water kiosk and it is expensive (30 Fr/jerrycan). People who can't afford it fetch water from dams",
								'it could be better for them if they get water pipeline near their houses, regular training of O&M of the water facility',
								'they wish water supply near their villages as was the plan before',
								'the improvement of water source and water quality test are needed',
								'improvement of water source is needed',
								'they wish more additionnal water pipes atleast 3, extension of water source is also needed',
								'there are able to contribute for O&M of spring if the source is improved and make themselves the water committee to manage the spring',
								'improvement of water source is needed, more additionnal of water pipes atleast 3',
								'extension of water source is really needed, more additionnal of water pipes atleast 5, they are able to contribute for O&M like 200rwf/HH per year if there is water committee to manage the water facility',
								'they need more additionnal water pipes atleast 5 and extension of water source is needed',
								'extension of water is needed',
								'they need more additionnal water pipes atleast 3 and extension of water source is needed',
								'there are able to contribute for O&M of spring if the source is improved',
								'improvement of water source is needed and more additionnal of water pipes atleast 4',
								'extension of water source is really needed and water pipeline near the villages',
								"They don't take care of the surrounding of the facility. Frequently, they use it as car wash (motocycles). If you take a care look in a container of this water, there is a kind of flocculent in. The spring is still new and generally with few problems.",
								'only they need water pipeline near their villages',
								'the extension of water source is needed',
								'the water committee is really needed to manage the water facility and the water pipeline nearby is also needed',
								'improvement of water source, more additionnal of water pipes atleast 5, the water committee is really needed',
								'new construction of water pipeline nearby',
								"They don't have any other water facility than walking more than 3 km to the nearest water spring",
								'they need water committee to manage water facility and water supply pipeline near the villages',
								"This village doesn't have any other alternative of water point",
								'Since April 2015 the facility is privatized only for this school and from then villagers are no longer have access to it. The private company that supplies water in this area (AYATEKE)  nfluenced the school to close the facility (for their own interests). As we talked a bit to the school representor, he mentioned this sentence "we set the water point and it is us who close it. It is our right".',
								'Piped schemes water is only available for only some times',
								'it could be better if someone give support of water quality analysis and regular training of O&M is really needed',
								'they ask support for handpump repairement and they are able to participate and make water committee to manage the handpump',
								'they want new construction of handpump near their households as this one is located far from where they live',
								'the maintenance of the handpump is needed and they are able to participate to any training in order to maintain well the water facility',
								'as its hard to pump water from handpump they need any support to help them to do maintenance and also regular training to the technicians is needed',
								'they suggest regular training for O&M of handpump',
								'they wish someone to help them to repair the handpump',
								'they need new water pipeline or new handpump near their houses',
								'no any issues',
								'they wish someone to help them to repair the handpump and if is repaired people are able to contribute for O&M of handpump like 300rwf/HHs per semester and make the committee themselves',
								'they wish someone to help them to repair the handpump and if is repaired people are able to contribute for O&M of handpump like 500rwf/HHs per year',
								'they wish someone to help them to repair the handpump and regular training is also needed',
								'they want someone who can help for water quality analysis, then after repairement',
								'they wish someone to help them to do water quality test',
								'they want someone who can help for water quality analysis',
								'it could be better if someone give support of repairement because people using uncleaned water, regular training are really needed',
								"When they called Living water international to come to repair the facility, the organization came and took back all possible spare parts that they could take from the facility and then they went back and never came back to repair the facility. This was done in 2013. Until no, they don't have any further information on what is going on.",
								'They are willing to contribute financially in order to have a proper management of the facility, also to participate in trainings on O&M',
								"they don't have any alternative of clean water.",
								"They ried even to repair the facility by themselves but it didn't last as they don't have knowledge  on O&M. They are willing to participate in trainings on O&M",
								'they really ask support for hand pump repairement and training for water facility management',
								'they need someone to do water test, new construction of water pipeline or spring are needed',
								'they are asking support and help for repairement and they shall contribute if there is committee to manage, they could pay 500rwf/HH per year for O&M',
								'they need regular training of O&M for handpump and repairement of it',
								'they need regular training of O&M for handpump and repairement of it, the committee to manage the handpump is also needed',
								'someone or the water committee to manage the spring is really needed',
								'they need more additionnal water pipes and extension of water source',
								'they need regular training for local technicians and extension of water source',
								'they would like to have water committee to manage water facility, also they want extension of water source and more additinnal water pipes atleast 4',
								'they need water committee to manage the water faculity',
								'they would like to have water supply pipeline near their households and extension of water source, and it will be better if someone help them to do water quality test to insure that the water they use is of good quality',
								'they need more additionnal water pipes like 3; tools and training for the O&M of springs are also needed; it will be better to provide a good O&M to the other piped network (Rwamuhogo) to prevent the queue to this spring',
								'the source needs to be rehabilitated and the leaders are able to make water committee and do O&M of the spring if is improved',
								'they need water committee to manage water facility; more additionnal pipes and rehabilitation of the water source',
								'no suggestion',
								'they need improvement of the spring and water supply near their houses',
								'they need water committee to manage the facility and improvement of the water source',
								'they need rehabilitation of the water spring',
								'they request rehabilitation of the spring and to add more pipes to feed several people at the same time',
								'they need water committee to manage the facility and rehabilitation of water source',
								'There is a need to strengthen maintenance. The drainage system is not good.',
								'The surrounding area is very dirty. The pipe is broken and they used clothes to re-attach it.',
								'the spring is good with clean water, but people misuse (there are pee and poo smelling everywhere in the surrounding), probably that could indicate the high concentration of coliforms. They would like a help to establish WUC in the village.',
								'they need water committee to manage the spring, extension of water source is needed',
								'they wish water supply near their households because citizen are suffering to get water from the spring',
								'they wish water supply near their villages or new construction of water spring',
								'they need more additionnal water pipes atleast 4 and extension of water source is needed',
								'they would like to have water committee to manage water facility, also they want extension of water source and more additinnal water pipes atleast 5',
								"They once contributed 30,000 Fr to repair and rehabilitate the spring but during that time AEE came to help them. However, the person in charge didn't take any further step to strengthen the works but he kept the money with him, up this time of surveying.",
								'the  spring is leaking around the source.',
								'when there is water shortage in piped schemes, they fetch water directly from swamps because water quantity is very small regarding the demand'
							]
						},
						{
							attribute: 'status',
							type: 'number',
							count: 768,
							min: 1,
							max: 3,
							mean: 1.5221354166666667,
							median: 1,
							std: 0.8782640352804448,
							values: [1, 2, 3]
						},
						{
							attribute: 'id',
							type: 'number',
							count: 768,
							min: 1,
							max: 768,
							mean: 384.5,
							median: 384.5,
							std: 221.84679398179276,
							histogram: {
								count: [154, 153, 154, 153, 154],
								bins: [1, 154.4, 307.8, 461.20000000000005, 614.6, 768]
							}
						}
					]
				}
			]
		}
	}
};
describe('PropertySelect Component', () => {
	let component: RenderResult<PropertySelect>;
	beforeEach(() => {
		const metadata = layer as VectorTileMetadata;
		component = render(PropertySelect, {
			props: {
				layerId: layer.id,
				metadata: metadata,
				propertySelectValue: 'hand_pump_type_name',
				showEmptyFields: true,
				inLegend: false,
				emptyFieldLabel: 'No data'
			}
		});
	});
	it('should render', () => {
		expect(component.getByTestId('property-select')).toBeDefined();
	});
	// it('should render the correct number of options', async () => {
	//
	// })
});