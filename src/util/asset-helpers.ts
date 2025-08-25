import { getType } from 'mime';
import fs from 'fs/promises';

export const assetHelpers = {
	getMimeType: (filePath: string): string => {
		return getType(filePath) ?? 'application/octet-stream';
	},

	getFileSize: async (filePath: string): Promise<number> => {
		const stats = await fs.stat(filePath);
		return stats.size;
	},

	readFileChunk: async (filePath: string, offset: number, length: number) => {
		const fd = await fs.open(filePath, 'r');
		try {
			const buffer = Buffer.alloc(length);
			const { bytesRead } = await fd.read(buffer, 0, length, offset);
			return buffer.subarray(0, bytesRead);
		} finally {
			await fd.close();
		}
	},
};
