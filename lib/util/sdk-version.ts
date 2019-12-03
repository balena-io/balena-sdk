// This gets replaced on build time.
// We do not require() the package.json, since
// (depending on their bundler used) it would result it
// being embedded in the dist of the consumer project
// which we want to avoid, both b/c of the dist size increase &
// the security concerns of including the versions of the dependencies
const sdkVersion = '__REPLACE_WITH_PACKAGE_JSON_VERSION__';
export default sdkVersion;
