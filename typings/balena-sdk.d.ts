import * as BalenaErrors from 'balena-errors';
import * as Promise from 'bluebird';
import { EventEmitter } from 'events';

import { Readable } from 'stream';

import * as BalenaPine from './balena-pine';
import { BalenaRequest } from './balena-request';
import * as Pine from './pinejs-client-core';

declare namespace BalenaSdk {
	type WithId = Pine.WithId;
	type PineDeferred = Pine.PineDeferred;
	type NavigationResource<T = WithId> = Pine.NavigationResource<T>;
	type ReverseNavigationResource<T = WithId> = Pine.ReverseNavigationResource<
		T
	>;
	type PineFilterFor<T> = Pine.Filter<T>;
	type PineExpandFor<T> = Pine.Expand<T>;
	type PineOptions = Pine.PineOptions;
	type PineOptionsFor<T> = Pine.PineOptionsFor<T>;
	type PineParams = Pine.PineParams;
	type PineParamsFor<T> = Pine.PineParamsFor<T>;
	type PineParamsWithIdFor<T> = Pine.PineParamsWithIdFor<T>;

	interface Interceptor {
		request?(response: any): Promise<any>;
		response?(response: any): Promise<any>;
		requestError?(error: Error): Promise<any>;
		responseError?(error: Error): Promise<any>;
	}

	interface Config {
		deployment: string | null;
		deviceUrlsBase: string;
		adminUrl: string;
		apiUrl: string;
		actionsUrl: string;
		gitServerUrl: string;
		pubnub: {
			subscribe_key: string;
			publish_key: string;
		};
		ga?: GaConfig;
		mixpanelToken?: string;
		intercomAppId?: string;
		recurlyPublicKey?: string;
		deviceTypes: DeviceType[];
		DEVICE_ONLINE_ICON: string;
		DEVICE_OFFLINE_ICON: string;
		signupCodeRequired: boolean;
		supportedSocialProviders: string[];
	}

	interface CurrentService {
		id: number;
		image_id: number;
		service_id: number;
		commit: string;
		download_progress: number;
		install_date: string;
		status: string;
	}

	interface CurrentGatewayDownload {
		id: number;
		image_id: number;
		service_id: number;
		download_progress: number;
		status: string;
	}

	interface DeviceWithServiceDetails extends Device {
		current_services: {
			[serviceName: string]: CurrentService[];
		};

		current_gateway_downloads: CurrentGatewayDownload[];
	}

	interface GaConfig {
		site: string;
		id: string;
	}

	interface DeviceType {
		slug: string;
		name: string;

		arch: string;
		state?: string;

		isDependent?: boolean;
		instructions?: string[] | DeviceTypeInstructions;
		gettingStartedLink?: string | DeviceTypeGettingStartedLink;
		stateInstructions?: { [key: string]: string[] };
		options?: DeviceTypeOptions[];
		initialization?: {
			options?: DeviceInitializationOptions[];
			operations: Array<{
				command: string;
			}>;
		};
		supportsBlink?: boolean;
		yocto: {
			fstype?: string;
			deployArtifact: string;
		};
		/** Holds the latest balenaOS version */
		buildId?: string;
	}

	interface DeviceTypeInstructions {
		linux: string[];
		osx: string[];
		windows: string[];
	}

	interface DeviceTypeGettingStartedLink {
		linux: string;
		osx: string;
		windows: string;
		[key: string]: string;
	}

	interface DeviceTypeOptions {
		options: DeviceTypeOptionsGroup[];
		collapsed: boolean;
		isCollapsible: boolean;
		isGroup: boolean;
		message: string;
		name: string;
	}

	interface DeviceInitializationOptions {
		message: string;
		type: string;
		name: string;
	}

	interface DeviceTypeOptionsGroup {
		default: number | string;
		message: string;
		name: string;
		type: string;
		min?: number;
		choices?: string[] | number[];
		choicesLabels?: { [key: string]: string };
	}

	interface SocialServiceAccount {
		provider: string;
		display_name: string;
		created_at: string;
		id: number;
		remote_id: string;

		belongs_to__user: NavigationResource<User>;
	}

	interface User {
		account_type?: string;
		actualUser?: number;
		company?: string;
		created_at: string;
		email?: string;
		features?: string[];
		first_name?: string;
		hasPasswordSet?: boolean;
		has_disabled_newsletter?: boolean;
		id: number;
		intercomUserName?: string;
		intercomUserHash?: string;
		jwt_secret: string;
		last_name?: string;
		loginAs?: boolean;
		needsPasswordReset?: boolean;
		permissions?: string[];
		public_key?: boolean;
		twoFactorRequired?: boolean;
		username: string;

		application: ReverseNavigationResource<Application>;
		creates__release: ReverseNavigationResource<Release>;
		owns__device: ReverseNavigationResource<Device>;
		user__is_member_of__application: ReverseNavigationResource<
			ApplicationMember
		>;
		// this is what the api route returns
		social_service_account: ReverseNavigationResource<SocialServiceAccount>;
	}

	interface ApiKey {
		id: number;
		created_at: string;
		name: string;
		description: string | null;
	}

	interface Application {
		app_name: string;
		device_type: string;
		slug: string;
		commit: string;
		id: number;
		device_type_info?: DeviceType;
		has_dependent?: boolean;
		is_accessible_by_support_until__date: string;
		should_track_latest_release: boolean;

		application_type: NavigationResource<ApplicationType>;
		user: NavigationResource<User>;
		depends_on__application: NavigationResource<Application>;

		application_config_variable: ReverseNavigationResource<ApplicationVariable>;
		application_environment_variable: ReverseNavigationResource<
			ApplicationVariable
		>;
		application_tag: ReverseNavigationResource<ApplicationTag>;
		owns__device: ReverseNavigationResource<Device>;
		owns__release: ReverseNavigationResource<Release>;
		is_depended_on_by__application: ReverseNavigationResource<Application>;
		user__is_member_of__application: ReverseNavigationResource<
			ApplicationMember
		>;
	}

	interface ApplicationMember {
		id: number;
		application_membership_role: NavigationResource<ApplicationMembershipRole>;
		is_member_of__application: NavigationResource<Application>;
		user: NavigationResource<User>;
	}

	interface ApplicationMembershipRole {
		id: number;
		name: string;
	}

	interface ApplicationType {
		id: number;
		name: string;
		slug: string;
		description: string | null;
		supports_gateway_mode: boolean;
		supports_multicontainer: boolean;
		supports_web_url: boolean;
		is_legacy: boolean;
		requires_payment: boolean;
		needs__os_version_range: string | null;
		maximum_device_count: number | null;
	}

	type ReleaseStatus =
		| 'cancelled'
		| 'error'
		| 'failed'
		| 'interrupted'
		| 'local'
		| 'running'
		| 'success'
		| 'timeout'
		| null;

	interface Release {
		log: string;
		commit: string;
		created_at: string;
		id: number;
		composition: string | null;
		source: string;
		end_timestamp: string;
		push_timestamp: string | null;
		start_timestamp: string;
		status: ReleaseStatus;
		update_timestamp: string | null;

		contains__image: null | Array<{
			id: number;
			image: NavigationResource<Image>;
		}>;
		is_created_by__user: NavigationResource<User>;
		belongs_to__application: NavigationResource<Application>;

		release_tag: ReverseNavigationResource<ReleaseTag>;
	}

	interface BillingAccountAddressInfo {
		address1: string;
		address2: string;
		city: string;
		state: string;
		zip: string;
		country: string;
		phone: string;
	}

	interface BillingAccountInfo {
		account_state: string;
		first_name: string;
		last_name: string;
		company_name: string;
		cc_emails: string;
		vat_number: string;
		address: BillingAccountAddressInfo;
	}

	type BillingInfoType = 'bank_account' | 'credit_card' | 'paypal';

	interface BillingInfo {
		full_name: string;

		first_name: string;
		last_name: string;
		company: string;
		vat_number: string;
		address1: string;
		address2: string;
		city: string;
		state: string;
		zip: string;
		country: string;
		phone: string;

		type?: BillingInfoType;
	}

	interface CardBillingInfo extends BillingInfo {
		card_type: string;
		year: string;
		month: string;
		first_one: string;
		last_four: string;
	}

	interface BankAccountBillingInfo extends BillingInfo {
		account_type: string;
		last_four: string;
		name_on_account: string;
		routing_number: string;
	}

	interface TokenBillingSubmitInfo {
		token_id: string;
	}

	interface BillingPlanInfo {
		name: string;
		tier: string;
		billing: BillingPlanBillingInfo;
		intervalUnit?: string;
		intervalLength?: string;
		addonPlan?: BillingAddonPlanInfo;
	}

	interface BillingAddonPlanInfo {
		code: string;
		currentPeriodEndDate?: string;
		billing: BillingPlanBillingInfo;

		addOns: Array<{
			code: string;
			unitCostCents?: string;
			quantity?: string;
		}>;
	}

	interface BillingPlanBillingInfo {
		currency: string;
		currencySymbol?: string;
		totalCostCents: string;

		charges: Array<{
			itemType: string;
			name: string;
			code: string;
			unitCostCents: string;
			quantity: string;
		}>;
	}

	interface InvoiceInfo {
		closed_at: string;
		created_at: string;
		due_on: string;
		currency: string;
		invoice_number: string;
		subtotal_in_cents: string;
		total_in_cents: string;
		uuid: string;
		state: 'pending' | 'paid' | 'failed' | 'past_due';
	}

	interface Device {
		app_name: string;
		created_at: string;
		custom_latitude?: string;
		custom_longitude?: string;
		device_name: string;
		device_type: string;
		download_progress?: number;
		has_dependent: boolean;
		id: number;
		ip_address: string | null;
		is_accessible_by_support_until__date: string;
		is_connected_to_vpn: boolean;
		is_in_local_mode?: boolean;
		is_locked_until__date: string;
		is_on__commit: string;
		is_web_accessible: boolean;
		is_active: boolean;
		is_online: boolean;
		last_connectivity_event: string;
		latitude?: string;
		local_id?: string;
		location: string;
		longitude?: string;
		note: string;
		os_variant?: string;
		os_version: string;
		provisioning_progress?: number;
		provisioning_state: string;
		state?: { key: string; name: string };
		status: string;
		status_sort_index?: number;
		supervisor_version: string;
		uuid: string;
		vpn_address: string | null;
		should_be_managed_by__supervisor_release: number;

		belongs_to__application: NavigationResource<Application>;
		belongs_to__user: NavigationResource<User>;
		should_be_running__release: NavigationResource<Release>;
		is_managed_by__service__instance: NavigationResource<ServiceInstance>;
		is_managed_by__device: NavigationResource<Device>;

		device_config_variable: ReverseNavigationResource<DeviceVariable>;
		device_environment_variable: ReverseNavigationResource<DeviceVariable>;
		device_tag: ReverseNavigationResource<DeviceTag>;
		manages__device: ReverseNavigationResource<Device>;
	}

	interface SupervisorRelease {
		created_at: string;
		id: number;
		supervisor_version: string;
		device_type: string;
		image_name: string;
		is_public: boolean;
		note?: string;
	}

	interface ServiceInstance {
		created_at: string;
		id: number;
		service_type: string;
		ip_address: string;
		last_heartbeat: string;
	}

	interface Service {
		id: number;
		service_name: string;
		application: NavigationResource<Application>;
	}

	interface Image {
		id: number;
		build_log: string;
		is_a_build_of__service: NavigationResource<Service>;
		start_timestamp?: string | null;
		end_timestamp?: string | null;
		image_size?: number | null;
		dockerfile: string;
		error_message?: string | null;
	}

	interface LogMessage {
		message: string;
		isSystem: boolean;
		createdAt: number;
		timestamp: number;
		serviceId?: number;
		isStdErr: boolean;
	}

	interface LogsSubscription extends EventEmitter {
		unsubscribe(): void;
	}

	interface LogsOptions {
		count?: number | 'all';
	}

	interface SSHKey {
		title: string;
		public_key: string;
		id: number;
		created_at: string;
	}

	type ImgConfigOptions = {
		network?: 'ethernet' | 'wifi';
		appUpdatePollInterval?: number;
		wifiKey?: string;
		wifiSsid?: string;
		ip?: string;
		gateway?: string;
		netmask?: string;
		version: string;
	};

	type OsVersions = {
		latest: string;
		recommended: string;
		default: string;
		versions: string[];
	};

	interface ServiceInstall {
		id: number;
		should_be_running: boolean;
		device: NavigationResource<Device>;
		installs__service: NavigationResource<Service>;
		service: Service[];
		application: NavigationResource<Application>;
	}

	interface EnvironmentVariableBase {
		id: number;
		name: string;
		value: string;
	}

	interface DeviceServiceEnvironmentVariable extends EnvironmentVariableBase {
		service_install: NavigationResource<ServiceInstall>;
	}

	interface ServiceEnvironmentVariable extends EnvironmentVariableBase {
		service: NavigationResource<Service>;
	}

	interface DeviceVariable extends EnvironmentVariableBase {
		device: NavigationResource<Device>;
	}

	interface ApplicationVariable extends EnvironmentVariableBase {
		application: NavigationResource<Application>;
	}

	interface ResourceTagBase {
		id: number;
		tag_key: string;
		value: string;
	}

	interface ApplicationTag extends ResourceTagBase {
		application: NavigationResource<Application>;
	}

	interface DeviceTag extends ResourceTagBase {
		device: NavigationResource<Device>;
	}

	interface ReleaseTag extends ResourceTagBase {
		release: NavigationResource<Release>;
	}

	interface BalenaSDK {
		auth: {
			register: (
				credentials: { email: string; password: string },
			) => Promise<string>;
			authenticate: (
				credentials: { email: string; password: string },
			) => Promise<string>;
			login: (
				credentials: { email: string; password: string },
			) => Promise<void>;
			loginWithToken: (authToken: string) => Promise<void>;
			logout: () => Promise<void>;
			getToken: () => Promise<string>;
			whoami: () => Promise<string | undefined>;
			isLoggedIn: () => Promise<boolean>;
			getUserId: () => Promise<number>;
			getEmail: () => Promise<string>;

			twoFactor: {
				isEnabled: () => Promise<boolean>;
				isPassed: () => Promise<boolean>;
				challenge: (code: string) => Promise<void>;
			};
		};

		settings: {
			get(key: string): Promise<string>;
			getAll(): Promise<{ [key: string]: string }>;
		};

		request: BalenaRequest;

		errors: typeof BalenaErrors;

		models: {
			application: {
				create(options: {
					name: string;
					applicationType?: string;
					deviceType: string;
					parent?: number | string;
				}): Promise<Application>;
				get(
					nameOrId: string | number,
					options?: PineOptionsFor<Application>,
				): Promise<Application>;
				getWithDeviceServiceDetails(
					nameOrId: string | number,
					options?: PineOptionsFor<Application>,
				): Promise<
					Application & {
						owns__device: DeviceWithServiceDetails[];
					}
				>;
				getAppByOwner(
					appName: string,
					owner: string,
					options?: PineOptionsFor<Application>,
				): Promise<Application>;
				getAll(options?: PineOptionsFor<Application>): Promise<Application[]>;
				getAllWithDeviceServiceDetails(
					options?: PineOptionsFor<Application>,
				): Promise<
					Array<
						Application & {
							owns__device: DeviceWithServiceDetails[];
						}
					>
				>;
				has(nameOrId: string | number): Promise<boolean>;
				hasAny(): Promise<boolean>;
				remove(nameOrId: string | number): Promise<void>;
				restart(nameOrId: string | number): Promise<void>;
				enableDeviceUrls(nameOrId: string | number): Promise<void>;
				disableDeviceUrls(nameOrId: string | number): Promise<void>;
				grantSupportAccess(
					nameOrId: string | number,
					expiryTimestamp: number,
				): Promise<void>;
				revokeSupportAccess(nameOrId: string | number): Promise<void>;
				reboot(appId: number, { force }: { force?: boolean }): Promise<void>;
				shutdown(appId: number, { force }: { force?: boolean }): Promise<void>;
				purge(appId: number): Promise<void>;
				generateApiKey(nameOrId: string | number): Promise<string>;
				generateProvisioningKey(nameOrId: string | number): Promise<string>;
				willTrackNewReleases(nameOrId: string | number): Promise<boolean>;
				isTrackingLatestRelease(nameOrId: string | number): Promise<boolean>;
				pinToRelease(
					nameOrId: string | number,
					fullReleaseHash: string,
				): Promise<void>;
				getTargetReleaseHash(nameOrId: string | number): Promise<string>;
				trackLatestRelease(nameOrId: string | number): Promise<void>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<ApplicationTag>,
					): Promise<ApplicationTag[]>;
					getAll(
						options?: PineOptionsFor<ApplicationTag>,
					): Promise<ApplicationTag[]>;
					set(
						nameOrId: string | number,
						tagKey: string,
						value: string,
					): Promise<void>;
					remove(nameOrId: string | number, tagKey: string): Promise<void>;
				};
				configVar: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<ApplicationVariable>,
					): Promise<ApplicationVariable[]>;
					set(
						nameOrId: string | number,
						key: string,
						value: string,
					): Promise<void>;
					get(
						nameOrId: string | number,
						key: string,
					): Promise<string | undefined>;
					remove(nameOrId: string | number, key: string): Promise<void>;
				};
				envVar: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<ApplicationVariable>,
					): Promise<ApplicationVariable[]>;
					set(
						nameOrId: string | number,
						key: string,
						value: string,
					): Promise<void>;
					get(
						nameOrId: string | number,
						key: string,
					): Promise<string | undefined>;
					remove(nameOrId: string | number, key: string): Promise<void>;
				};
			};
			apiKey: {
				create: (name: string, description?: string | null) => Promise<string>;
				getAll: (options?: PineOptionsFor<ApiKey>) => Promise<ApiKey[]>;
				update: (
					id: number,
					apiKeyInfo: { name?: string; description?: string | null },
				) => Promise<void>;
				revoke: (id: number) => Promise<void>;
			};
			release: {
				get(id: number, options?: PineOptionsFor<Release>): Promise<Release>;
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptionsFor<Release>,
				): Promise<Release[]>;
				getLatestByApplication(
					nameOrId: string | number,
					options?: PineOptionsFor<Release>,
				): Promise<Release[]>;
				getWithImageDetails(
					nameOrId: string | number,
					options?: {
						release?: PineOptionsFor<Release>;
						image?: PineOptionsFor<Image>;
					},
				): Promise<
					Array<
						Release & {
							images: Array<{
								id: number;
								service_name: string;
							}>;
							user: User;
						}
					>
				>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<ReleaseTag>,
					): Promise<ReleaseTag[]>;
					getAllByRelease(
						id: number,
						options?: PineOptionsFor<ReleaseTag>,
					): Promise<ReleaseTag[]>;
					getAll(options?: PineOptionsFor<ReleaseTag>): Promise<ReleaseTag[]>;
					set(releaseId: number, tagKey: string, value: string): Promise<void>;
					remove(releaseId: number, tagKey: string): Promise<void>;
				};
			};
			billing: {
				getAccount(): Promise<BillingAccountInfo>;
				getPlan(): Promise<BillingPlanInfo>;
				getBillingInfo(): Promise<BillingInfo>;
				updateBillingInfo(
					billingInfo: TokenBillingSubmitInfo,
				): Promise<BillingInfo>;
				getInvoices(): Promise<InvoiceInfo[]>;
				downloadInvoice(invoiceNumber: string): Promise<Blob>;
			};
			device: {
				get(
					uuidOrId: string | number,
					options?: PineOptionsFor<Device>,
				): Promise<Device>;
				getByName(
					nameOrId: string | number,
					options?: PineOptionsFor<Device>,
				): Promise<Device[]>;
				getWithServiceDetails(
					nameOrId: string | number,
					options?: PineOptionsFor<Device>,
				): Promise<DeviceWithServiceDetails>;
				getAll(options?: PineOptionsFor<Device>): Promise<Device[]>;
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptionsFor<Device>,
				): Promise<Device[]>;
				getAllByParentDevice(
					parentUuidOrId: string | number,
					options?: PineOptionsFor<Device>,
				): Promise<Device[]>;
				getName(uuidOrId: string | number): Promise<string>;
				getApplicationName(uuidOrId: string | number): Promise<string>;
				getApplicationInfo(
					uuidOrId: string | number,
				): Promise<{
					appId: string;
					commit: string;
					containerId: string;
					env: { [key: string]: string | number };
					imageId: string;
				}>;
				has(uuidOrId: string | number): Promise<boolean>;
				isOnline(uuidOrId: string | number): Promise<boolean>;
				getLocalIPAddressess(uuidOrId: string | number): Promise<string[]>;
				getDashboardUrl(uuid: string): string;
				getSupportedDeviceTypes(): Promise<string[]>;
				getManifestBySlug(slugOrName: string): Promise<DeviceType>;
				getManifestByApplication(
					nameOrId: string | number,
				): Promise<DeviceType>;
				move(
					uuidOrId: string | number,
					applicationNameOrId: string | number,
				): Promise<void>;
				note(uuidOrId: string | number, note: string): Promise<void>;
				remove(uuidOrId: string | number): Promise<void>;
				rename(uuidOrId: string | number, newName: string): Promise<void>;
				setCustomLocation(
					uuidOrId: string | number,
					location: { latitude: number; longitude: number },
				): Promise<void>;
				unsetCustomLocation(uuidOrId: string | number): Promise<void>;
				identify(uuidOrId: string | number): Promise<void>;
				startApplication(uuidOrId: string | number): Promise<void>;
				stopApplication(uuidOrId: string | number): Promise<void>;
				restartApplication(uuidOrId: string | number): Promise<void>;
				grantSupportAccess(
					uuidOrId: string | number,
					expiryTimestamp: number,
				): Promise<void>;
				revokeSupportAccess(uuidOrId: string | number): Promise<void>;
				reboot(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Promise<void>;
				shutdown(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Promise<void>;
				purge(uuidOrId: string | number): Promise<void>;
				update(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Promise<void>;
				getDisplayName(deviceTypeName: string): string;
				getDeviceSlug(deviceTypeName: string): string;
				generateUniqueKey(): string;
				register(
					applicationNameOrId: string | number,
					uuid: string,
				): Promise<{
					id: number;
					uuid: string;
					api_key: string;
				}>;
				generateDeviceKey(uuidOrId: string | number): Promise<string>;
				enableDeviceUrl(uuidOrId: string | number): Promise<void>;
				disableDeviceUrl(uuidOrId: string | number): Promise<void>;
				hasDeviceUrl(uuidOrId: string | number): Promise<boolean>;
				getDeviceUrl(uuidOrId: string | number): Promise<string>;
				enableTcpPing(uuidOrId: string | number): Promise<void>;
				disableTcpPing(uuidOrId: string | number): Promise<void>;
				ping(uuidOrId: string | number): Promise<void>;
				getStatus(device: object): string;
				lastOnline(device: Device): string;
				isTrackingApplicationRelease(
					uuidOrId: string | number,
				): Promise<boolean>;
				getTargetReleaseHash(uuidOrId: string | number): Promise<string>;
				pinToRelease(
					uuidOrId: string | number,
					fullReleaseHashOrId: string | number,
				): Promise<void>;
				trackApplicationRelease(uuidOrId: string | number): Promise<void>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<DeviceTag>,
					): Promise<DeviceTag[]>;
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptionsFor<DeviceTag>,
					): Promise<DeviceTag[]>;
					getAll(options?: PineOptionsFor<DeviceTag>): Promise<DeviceTag[]>;
					set(
						uuidOrId: string | number,
						tagKey: string,
						value: string,
					): Promise<void>;
					remove(uuidOrId: string | number, tagKey: string): Promise<void>;
				};
				configVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptionsFor<DeviceVariable>,
					): Promise<DeviceVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<DeviceVariable>,
					): Promise<DeviceVariable[]>;
					set(
						uuidOrId: string | number,
						key: string,
						value: string,
					): Promise<void>;
					get(
						uuidOrId: string | number,
						key: string,
					): Promise<string | undefined>;
					remove(uuidOrId: string | number, key: string): Promise<void>;
				};
				envVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptionsFor<DeviceVariable>,
					): Promise<DeviceVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<DeviceVariable>,
					): Promise<DeviceVariable[]>;
					set(
						uuidOrId: string | number,
						key: string,
						value: string,
					): Promise<void>;
					get(
						uuidOrId: string | number,
						key: string,
					): Promise<string | undefined>;
					remove(uuidOrId: string | number, key: string): Promise<void>;
				};
				serviceVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptionsFor<DeviceServiceEnvironmentVariable>,
					): Promise<DeviceServiceEnvironmentVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<DeviceServiceEnvironmentVariable>,
					): Promise<DeviceServiceEnvironmentVariable[]>;
					set(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
						value: string,
					): Promise<void>;
					get(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
					): Promise<string | undefined>;
					remove(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
					): Promise<void>;
				};
			};
			service: {
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptionsFor<Service>,
				): Promise<Service[]>;
				var: {
					getAllByService(
						id: number,
						options?: PineOptionsFor<ServiceEnvironmentVariable>,
					): Promise<ServiceEnvironmentVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptionsFor<ServiceEnvironmentVariable>,
					): Promise<ServiceEnvironmentVariable[]>;
					set(id: number, key: string, value: string): Promise<void>;
					get(id: number, key: string): Promise<string | undefined>;
					remove(id: number, key: string): Promise<void>;
				};
			};
			config: {
				getAll: () => Promise<Config>;
				getDeviceTypes: () => Promise<DeviceType[]>;
				getDeviceOptions(
					deviceType: string,
				): Promise<Array<DeviceTypeOptions | DeviceInitializationOptions>>;
			};
			image: {
				get(id: number, options?: PineOptionsFor<Image>): Promise<Image>;
				getLogs(id: number): Promise<string>;
			};
			key: {
				getAll(options?: PineOptionsFor<SSHKey>): Promise<SSHKey[]>;
				get(id: string | number): Promise<SSHKey>;
				remove(id: string | number): Promise<void>;
				create(title: string, key: string): Promise<SSHKey>;
			};
			os: {
				getConfig(
					nameOrId: string | number,
					options: ImgConfigOptions,
				): Promise<object>;
				getDownloadSize(slug: string, version?: string): Promise<number>;
				getSupportedVersions(slug: string): Promise<OsVersions>;
				getMaxSatisfyingVersion(
					deviceType: string,
					versionOrRange: string,
				): string;
				getLastModified(deviceType: string, version?: string): Promise<Date>;
				download(deviceType: string, version?: string): Promise<Readable>;
			};
		};

		logs: {
			history(uuid: string, options?: LogsOptions): Promise<LogMessage[]>;
			subscribe(uuid: string, options?: LogsOptions): Promise<LogsSubscription>;
		};

		pine: BalenaPine.Pine;
		interceptors: Interceptor[];
	}

	interface SdkOptions {
		apiUrl?: string;
		/**
		 * @deprecated Use balena.auth.loginWithToken(apiKey) instead
		 */
		apiKey?: string;
		imageMakerUrl?: string;
		dataDirectory?: string;
		isBrowser?: boolean;
		debug?: boolean;
	}

	interface SdkConstructor {
		(options?: SdkOptions): BalenaSdk.BalenaSDK;

		setSharedOptions(options: SdkOptions): void;
		fromSharedOptions: () => BalenaSdk.BalenaSDK;
	}
}

declare const BalenaSdk: BalenaSdk.SdkConstructor;

export = BalenaSdk;
