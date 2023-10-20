import type { PoolClient } from 'pg';

export const getDefaultLayerStyle = async (
	client: PoolClient,
	dataset_id: string,
	layer_id: string,
	layer_type: string
) => {
	const query = {
		text: `
            SELECT
                dataset_id,
                layer_id,
                layer_type,
                source,
                style,
                colormap_name,
                classification_method,
                created_user,
                createdat,
                updatedat,
                updated_user
            FROM geohub.dataset_defaultstyle
            WHERE
                dataset_id=$1
                AND layer_id=$2
                AND layer_type=$3
        `,
		values: [dataset_id, layer_id, layer_type]
	};

	const res = await client.query(query);
	if (res.rowCount === 0) {
		return;
	}
	const data = res.rows[0];
	return data;
};
