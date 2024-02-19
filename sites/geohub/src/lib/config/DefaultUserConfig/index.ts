import { DataPageSortingColumn } from './DataPageSortingColumn';
import { DatasetSearchLimit } from './DatasetSearchLimit';
import { DatasetSearchQueryOperator } from './DatasetSearchQueryOperator';
import { DatasetSortingColumn } from './DatasetSortingColumn';
import { DefaultMapStyle } from './DefaultMapStyle';
import { LineWidth } from './LineWidth';
import { MapPageSortingColumn } from './MapPageSortingColumn';
import { NumberOfClasses } from './NumberOfClasses';
import { DataPageSearchLimit } from './DataPageSearchLimit';
import { DataPageSearchQueryOperator } from './DataPageSearchQueryOperator';
import { DataPageTagSearchOperator } from './DataPageTagSearchOperator';
import { TagSearchOperator } from './TagSearchOperator';
import { SidebarPosition } from './SidebarPosition';
import type { ClassificationMethodTypes } from '$lib/config/AppConfig';
import { ClassificationMethod } from '$lib/config/DefaultUserConfig/ClassificationMethod';
import { LabelFontSize } from '$lib/config/DefaultUserConfig/LabelFontSize';
import { LabelHaloWidth } from '$lib/config/DefaultUserConfig/LabelHaloWidth';
import { IconOverlapPriority } from '$lib/config/DefaultUserConfig/IconOverlapPriority';
import { RasterResamplingMethod } from '$lib/config/DefaultUserConfig/RasterResamplingMethod';
import { IconSize } from '$lib/config/DefaultUserConfig/IconSize';
import { IconImage } from '$lib/config/DefaultUserConfig/IconImage';
import { LayerOpacity } from '$lib/config/DefaultUserConfig/LayerOpacity';
import { LinePattern } from '$lib/config/DefaultUserConfig/LinePattern';
import { MapPageSearchLimit } from './MapPageSearchLimit';
import { LabelTextFont } from './LabelTextFont';
import { DataPageIngestingJoinVectorTiles } from './DataPageIngestingJoinVectorTiles';
import { DataPageIngestingSortingColumn } from './DataPageIngestingSortingColumn';
import { DataPageIngestingSortingOrder } from './DataPageIngestingSortingOrder';
import { StacMaxCloudCover } from './StacMaxCloudCover';
import { StacSearchLimit } from './StacSearchLimit';
import { StacDateFilterOption } from './StacDateFilterOption';
import { FillExtrusionDefaultPitch } from './FillExtrusionDefaultPitch';
import type { TableViewType } from '$lib/types';
import { DataPageTableViewType } from './DataPageTableViewType';
import type { SidebarPosition as SidebarPositionType } from '@undp-data/svelte-sidebar';
import { HomePageMapSearchLimit } from './HomePageMapSearchLimit';
import { HomePageMapSortingColumn } from './HomePageMapSortingColumn';

export interface UserConfig {
	DatasetSearchLimit: number;
	DatasetSearchQueryOperator: 'and' | 'or';
	DatasetSortingColumn: string;
	DataPageSearchLimit: number;
	DataPageSearchQueryOperator: 'and' | 'or';
	DataPageSortingColumn: string;
	DataPageTagSearchOperator: 'and' | 'or';
	DataPageIngestingJoinVectorTiles: boolean;
	DataPageIngestingSortingColumn: string;
	DataPageIngestingSortingOrder: 'desc' | 'asc';
	DataPageTableViewType: TableViewType;
	TagSearchOperator: 'and' | 'or';
	MapPageSortingColumn: string;
	MapPageSearchLimit: number;
	LineWidth: number;
	NumberOfClasses: number;
	DefaultMapStyle: string;
	SidebarPosition: SidebarPositionType;
	ClassificationMethod: ClassificationMethodTypes;
	RasterResamplingMethod: 'nearest' | 'linear';
	LayerOpacity: number;
	HomePageMapSearchLimit: number;
	HomePageMapSortingColumn: string;
	IconImage: string;
	IconSize: number;
	IconOverlapPriority: 'always' | 'never' | 'cooperative';
	LinePattern: 'solid' | 'dash' | 'dot' | 'dashdot';
	LabelFontSize: number;
	LabelHaloWidth: number;
	LabelTextFont: string;
	StacMaxCloudCover: number;
	StacSearchLimit: number;
	StacDateFilterOption: number;
	FillExtrusionDefaultPitch: number;
}

export const DefaultUserConfig = {
	DefaultMapStyle,
	SidebarPosition,
	DatasetSearchLimit,
	DatasetSearchQueryOperator,
	DatasetSortingColumn,
	DataPageSearchLimit,
	DataPageSearchQueryOperator,
	DataPageSortingColumn,
	DataPageTagSearchOperator,
	DataPageIngestingJoinVectorTiles,
	DataPageIngestingSortingColumn,
	DataPageIngestingSortingOrder,
	DataPageTableViewType,
	TagSearchOperator,
	MapPageSortingColumn,
	MapPageSearchLimit,
	LineWidth,
	NumberOfClasses,
	ClassificationMethod,
	RasterResamplingMethod,
	LabelFontSize,
	LabelHaloWidth,
	LabelTextFont,
	HomePageMapSearchLimit,
	HomePageMapSortingColumn,
	IconOverlapPriority,
	IconSize,
	IconImage,
	LayerOpacity,
	LinePattern,
	StacMaxCloudCover,
	StacSearchLimit,
	StacDateFilterOption,
	FillExtrusionDefaultPitch
};
