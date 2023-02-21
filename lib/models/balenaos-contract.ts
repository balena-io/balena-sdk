import { Contract } from '../types/contract';

// Hardcoded host OS contract, this should be moved to the Yocto build process with meta-balena.
// Here for initial implementatin and testing purposes
const BalenaOS: Contract = {
	name: 'balenaOS',
	slug: 'balenaos',
	type: 'sw.os',
	description: 'Balena OS',
	partials: {
		image: [`{{#each deviceType.partials.instructions}}{{{this}}} {{/each}}`],
		internalFlash: [
			`{{#each deviceType.partials.connectDevice}}{{{this}}} {{/each}}`,
			`Write the {{name}} file you downloaded to the {{deviceType.name}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`{{#each deviceType.partials.disconnectDevice}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalFlash: [
			`Insert the {{deviceType.data.media.altBoot.[0]}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.altBoot.[0]}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.altBoot.[0]}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.altBoot.[0]}} into the {{deviceType.name}}.`,
			`<strong role="alert">Warning!</strong> This will also completely erase internal storage medium, so please make a backup first.`,
			`{{#each deviceType.partials.bootDeviceExternal}}{{{this}}} {{/each}}`,
			`Wait for the {{deviceType.name}} to finish flashing and shutdown. {{#if deviceType.partials.flashIndicator}}Please wait until {{deviceType.partials.flashIndicator}}.{{/if}}`,
			`Remove the {{deviceType.data.media.altBoot.[0]}} from the {{deviceType.name}}.`,
			`{{#each deviceType.partials.bootDeviceInternal}}{{{this}}} {{/each}}`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		externalBoot: [
			`Insert the {{deviceType.data.media.defaultBoot}} to the host machine.`,
			`Write the {{name}} file you downloaded to the {{deviceType.data.media.defaultBoot}}. We recommend using <a href="http://www.etcher.io/">Etcher</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`Remove the {{deviceType.data.media.defaultBoot}} from the host machine.`,
			`Insert the freshly flashed {{deviceType.data.media.defaultBoot}} into the {{deviceType.name}}.`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		jetsonFlash: [
			`Put the device in recovery mode and connect to the host computer via USB`,
			`{{#if deviceType.partials.jetsonNotes}}{{#each deviceType.partials.jetsonNotes}}{{{this}}} {{/each}}{{/if}}`,
			`Unzip the {{name}} image and use the Jetson Flash tool to flash the {{deviceType.name}} found at <a href="https://github.com/balena-os/jetson-flash">https://github.com/balena-os/jetson-flash</a>.`,
			`Wait for writing of {{name}} to complete.`,
			`{{{deviceType.partials.bootDevice}}} to boot the device.`,
		],
		radxaFlash: [
			`Enable maskrom mode and connect the device to your computer.`,
		],
		edisonFlash: {
			Linux: [
				`{{#each deviceType.partials.Linux.flashDependencies}}{{{this}}} {{/each}}`,
				`Unplug the {{deviceType.name}} from your system`,
				`Unzip the downloaded {{name}} file`,
				`{{#each deviceType.partials.Linux.flashInstructions}}{{{this}}} {{/each}}`,
				`Plug the {{deviceType.name}} as per the instructions on your terminal.`,
				`You can check the progress of the provisioning on your terminal.`,
			],
			MacOS: [
				`{{#each deviceType.partials.MacOS.flashDependencies}}{{{this}}} {{/each}}`,
				`Unplug the {{deviceType.name}} from your system`,
				`Unzip the downloaded {{name}} file`,
				`{{#each deviceType.partials.MacOS.flashInstructions}}{{{this}}} {{/each}}`,
				`Plug the {{deviceType.name}} as per the instructions on your terminal.`,
				`You can check the progress of the provisioning on your terminal.`,
			],
			Windows: [
				`{{#each deviceType.partials.Windows.flashDependencies}}{{{this}}} {{/each}}`,
				`Unplug the {{deviceType.name}} from your system`,
				`Unzip the downloaded {{name}} file`,
				`{{#each deviceType.partials.Windows.flashInstructions}}{{{this}}} {{/each}}`,
				`Plug the {{deviceType.name}} as per the instructions on your terminal.`,
				`You can check the progress of the provisioning on your terminal.`,
			],
		},
	},
};

export { BalenaOS };
