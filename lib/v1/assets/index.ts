// lib/v1/assets/index.ts

export { extractAssetsForEmail, backfillAssets } from './extract';
export { getAssets, getAssetFilterOptions } from './queries';
export type { Asset, AssetFilters, AssetType, MimeCategory } from './types';
export { getMimeCategory, getDomainLabel, KNOWN_DOMAINS } from './types';
