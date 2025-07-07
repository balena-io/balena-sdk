const filePathUploadNotImplementedForBrowser = () => {
	throw new Error('File path uploads are not supported in the browser.');
};

export const assetHelpers = {
	getMimeType: filePathUploadNotImplementedForBrowser,

	getFileSize: filePathUploadNotImplementedForBrowser,

	readFileChunk: filePathUploadNotImplementedForBrowser,
};
