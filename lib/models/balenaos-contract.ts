import { Contract } from '../types/contract';

// Hardcoded host OS contract, this should be moved to the Yocto build process with meta-balena.
// Here for initial implementatin and testing purposes
const BalenaOS: Contract = {
	name: 'balenaOS',
	slug: 'balenaos',
	type: 'sw.os',
	description: 'Balena OS',
	partials: {
		internalFlash: [
			`{{#each deviceType.partials.connectDevice}}{{{this}}} {{/each}}`,
			`Write the {{name}} file you downloaded to the {{deviceType.name}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`{{#each deviceType.partials.disconnectDevice}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalFlash: [
			`Insert the {{deviceType.data.media.installation}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.installation}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.installation}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.installation}} into the {{deviceType.name}}.`,
			`<strong role="alert">Warning!</strong> This will also completely erase internal storage medium, so please make a backup first.`,
			`{{#each deviceType.partials.bootDeviceExternal}}{{{this}}} {{/each}}`,
			`Wait for the {{deviceType.name}} to finish flashing and shutdown. {{#if deviceType.partials.flashIndicator}}Please wait until {{deviceType.partials.flashIndicator}}.{{/if}}`,
			`Remove the {{deviceType.data.media.installation}} from the {{deviceType.name}}.`,
			`{{#each deviceType.partials.bootDeviceInternal}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalBoot: [
			`Insert the {{deviceType.data.media.installation}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.installation}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.installation}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.installation}} into the {{deviceType.name}}.`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		jetsonFlash: [
			`Put the device in recovery mode and connect to the host computer via USB`,
			`{{#each deviceType.partials.jetsonNotes}}{{{this}}} {{/each}}`,
			`Unzip the {{name}} image and use the Jetson Flash tool to flash the {{deviceType.name}} found at <a href="https://github.com/balena-os/jetson-flash">https://github.com/balena-os/jetson-flash</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		custom: [
			`{{#each deviceType.partials.instructions}}
				{{{this}}}
			{{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
	},
};

export { BalenaOS };
