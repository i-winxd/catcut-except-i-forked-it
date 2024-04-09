export const MS_OPTIONS = { colonNotation: true, secondsDecimalDigits: 2, keepDecimalsOnWholeSeconds: true };

export function validEvent(e: MouseEvent) {
	return (e as any).pointerType !== '';
}

export function relativeTime(rtf: Intl.RelativeTimeFormat, seconds: number) {
	if (Math.abs(seconds) < 60) return rtf.format(seconds, 'second');
	if (Math.abs(seconds) <= 3600) return rtf.format(Math.round(seconds / 60), 'minute');
	if (Math.abs(seconds) <= 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
	if (Math.abs(seconds) <= 2592000) return rtf.format(Math.round(seconds / 86400), 'day');
	if (Math.abs(seconds) <= 31536000) return rtf.format(Math.round(seconds / 2592000), 'month');
	return rtf.format(Math.round(seconds / 31536000), 'year');
}

export function blobToDataURL(blob: Blob):Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export class RemoteFile {
	type: string;
	originalURL?: string;
	blob?: Blob;

	constructor(public name: string, public size: number, public url: string, type?: string) {
		this.type = type ?? name.includes('.') ? RemoteFile.extensionToType(name.split('.').reverse()[0]) : '';
	}

	static extensionToType(extension: string) {
		if (['webm', 'mp4', 'mkv', 'm4a'].includes(extension)) return `video/${extension}`;
		return '';
	}

	static async fetch(url: string, name?: string) {
		const response = await fetch(url);
		const blob = await response.blob();
		// TODO use & parse Content-Disposition header
		// Content-Disposition: inline; filename="3T6ShR37x3Ea5JOK.mp4"; filename*=UTF-8''3T6ShR37x3Ea5JOK.mp4
		if (!name) name = url.split('/').reverse()[0];
		const file = new RemoteFile(name, blob.size, URL.createObjectURL(blob), blob.type);
		file.originalURL = url;
		file.blob = blob;
		return file;
	}

	release() {
		if (this.url.startsWith('blob:')) URL.revokeObjectURL(this.url);
	}
}
