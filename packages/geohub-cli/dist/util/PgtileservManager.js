"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
class PgtileservManager {
    pgtileservUrl;
    constructor(pgtileservUrl) {
        this.pgtileservUrl = pgtileservUrl;
    }
    async load() {
        const res = await fetch(this.pgtileservUrl);
        const indexJson = await res.json();
        const datasets = [];
        const tableNames = Object.keys(indexJson);
        for (let i = 0; i < tableNames.length; i++) {
            const id = tableNames[i];
            const layer = indexJson[id];
            if (layer.name.startsWith('tool_'))
                continue;
            const detailUrl = layer.detailurl;
            const resDetail = await fetch(detailUrl);
            const detailJson = await resDetail.json();
            const now = new Date().toISOString();
            let bounds = detailJson.bounds;
            if (!bounds) {
                bounds = [-180, -90, 180, 90];
            }
            const dataset = {
                id: (0, helpers_1.generateHashKey)(detailJson.tileurl),
                url: detailJson.tileurl,
                is_raster: false,
                name: (0, helpers_1.cleanName)(layer.name),
                description: layer.description,
                bounds: bounds,
                createdat: now,
                updatedat: now,
                tags: [
                    {
                        key: 'type',
                        value: 'pgtileserv'
                    },
                    {
                        key: 'layertype',
                        value: layer.type
                    },
                    {
                        key: 'schema',
                        value: layer.schema
                    },
                    {
                        key: 'table',
                        value: layer.name
                    },
                    {
                        key: 'id',
                        value: layer.id
                    },
                    {
                        key: 'provider',
                        value: 'United Nations Development Programme (UNDP)'
                    }
                ]
            };
            if (detailJson.geometrytype) {
                dataset.tags?.push({
                    key: 'geometrytype',
                    value: detailJson.geometrytype
                });
            }
            datasets.push(dataset);
        }
        return { datasets: datasets };
    }
}
exports.default = PgtileservManager;
