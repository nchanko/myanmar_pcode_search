import pkg from '../../package.json';
import dataInfo from '../../public/data/pcode-meta.json';

// Single source for the version numbers shown in the UI and docs, so a new
// release or dataset never means hunting through hardcoded strings.

/** App version from package.json. Release notes: CHANGELOG.md */
export const APP_VERSION = pkg.version;
export const CHANGELOG_URL = 'https://github.com/nchanko/myanmar_pcode_search/blob/main/CHANGELOG.md';

/** Bundled dataset: MIMU release and counts, written by scripts/build-data.ts */
export const DATA_INFO = dataInfo;
