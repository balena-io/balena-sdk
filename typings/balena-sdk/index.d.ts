import type * as BalenaErrors from 'balena-errors';
import type { EventEmitter } from 'events';

import type * as BalenaPine from '../balena-pine';
import type {
	BalenaRequest,
	BalenaRequestStreamResult,
} from '../balena-request';
import type * as DeviceOverallStatus from './device-overall-status';
import type * as OsTypes from './os-types';
import type * as Pine from '../pinejs-client-core';
import { AtLeast } from '../utils';
import type * as DeviceState from './device-state';
import type * as DeviceTypeJson from './device-type-json';
import {
	Application,
	ApplicationTag,
	ApplicationMembershipRoles,
	BuildVariable,
	ApplicationInvite,
	OrganizationInvite,
	Release,
	Image,
	Device,
	DeviceTag,
	ReleaseTag,
	ApplicationVariable,
	ApiKey,
	DeviceVariable,
	DeviceServiceEnvironmentVariable,
	Service,
	ServiceEnvironmentVariable,
	SSHKey,
	Organization,
	OrganizationMembership,
	OrganizationMembershipRoles,
	OrganizationMembershipTag,
	User,
} from './models';

export * as DeviceState from './device-state';
export * as DeviceTypeJson from './device-type-json';
export * from './models';
export * from './jwt';

export type {
	WithId,
	PineDeferred,
	NavigationResource,
	OptionalNavigationResource,
	ReverseNavigationResource,
	ParamsObj as PineParams,
	ParamsObjWithId as PineParamsWithId,
	Filter as PineFilter,
	Expand as PineExpand,
	ODataOptionsWithSelect as PineOptionsWithSelect,
	ODataOptionsWithFilter as PineOptionsWithFilter,
	SelectableProps as PineSelectableProps,
	ExpandableProps as PineExpandableProps,
	ExpandResultObject as PineExpandResultObject,
	TypedResult as PineTypedResult,
} from '../pinejs-client-core';
export type { PineStrict } from '../balena-pine';

// TODO: Drop in the next major
import type { PineStrict } from '../balena-pine';
/** @deprecated */
export type PineWithSelectOnGet = PineStrict;

export type PineOptions<T> = Pine.ODataOptions<T>;
export type PineSubmitBody<T> = Pine.SubmitBody<T>;

export interface Interceptor {
	request?(response: any): Promise<any>;
	response?(response: any): Promise<any>;
	requestError?(error: Error): Promise<any>;
	responseError?(error: Error): Promise<any>;
}

/* types for the /config endppoint */
export interface Config {
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
	deviceTypes: DeviceTypeJson.DeviceType[];
	DEVICE_ONLINE_ICON: string;
	DEVICE_OFFLINE_ICON: string;
	signupCodeRequired: boolean;
	supportedSocialProviders: string[];
}

export interface GaConfig {
	site: string;
	id: string;
}

/* types for the DeviceWithServiceDetails objects */
export interface CurrentService {
	id: number;
	image_id: number;
	service_id: number;
	download_progress: number | null;
	status: string;
	install_date: string;
}

export interface CurrentServiceWithCommit extends CurrentService {
	commit: string;
}

export interface CurrentGatewayDownload {
	id: number;
	image_id: number;
	service_id: number;
	download_progress: number;
	status: string;
}

export interface DeviceWithServiceDetails<
	TCurrentService extends CurrentService = CurrentService
> extends Device {
	current_services: {
		[serviceName: string]: TCurrentService[];
	};

	current_gateway_downloads: CurrentGatewayDownload[];
}

export interface ApplicationInviteOptions {
	invitee: string;
	roleName?: ApplicationMembershipRoles;
	message?: string;
}

export interface OrganizationInviteOptions {
	invitee: string;
	roleName?: OrganizationMembershipRoles;
	message?: string;
}

export interface ReleaseWithImageDetails extends Release {
	images: Array<{
		id: number;
		service_name: string;
	}>;
	user: Pick<User, 'id' | 'username'> | undefined;
}

export interface BillingAccountAddressInfo {
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	phone: string;
}

export interface BillingAccountInfo {
	account_state: string;
	first_name: string;
	last_name: string;
	company_name: string;
	cc_emails: string;
	vat_number: string;
	address: BillingAccountAddressInfo;
}

export type BillingInfoType = 'bank_account' | 'credit_card' | 'paypal';

export interface BillingInfo {
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

export interface CardBillingInfo extends BillingInfo {
	card_type: string;
	year: string;
	month: string;
	first_one: string;
	last_four: string;
}

export interface BankAccountBillingInfo extends BillingInfo {
	account_type: string;
	last_four: string;
	name_on_account: string;
	routing_number: string;
}

export interface TokenBillingSubmitInfo {
	token_id: string;
	'g-recaptcha-response'?: string;
}

export interface BillingPlanInfo {
	name: string;
	title: string;
	code: string;
	tier: string;
	currentPeriodEndDate?: string;
	intervalUnit?: string;
	intervalLength?: string;
	addonPlan?: BillingAddonPlanInfo;
	billing: BillingPlanBillingInfo;
	support: {
		name: string;
		title: string;
	};
}

export interface BillingAddonPlanInfo {
	code: string;
	currentPeriodEndDate?: string;
	billing: BillingPlanBillingInfo;

	addOns: Array<{
		code: string;
		unitCostCents?: string;
		quantity?: string;
	}>;
}

export interface BillingPlanBillingInfo {
	currency: string;
	totalCostCents: string;

	charges: Array<{
		itemType: string;
		name: string;
		code: string;
		unitCostCents: string;
		quantity: string;
		isQuantifiable?: boolean;
	}>;
}

export interface InvoiceInfo {
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

export type DeviceMetrics = Pick<
	Device,
	| 'memory_usage'
	| 'memory_total'
	| 'storage_block_device'
	| 'storage_usage'
	| 'storage_total'
	| 'cpu_usage'
	| 'cpu_temp'
	| 'cpu_id'
	| 'is_undervolted'
>;

export interface SupervisorStatus {
	api_port: string;
	ip_address: string;
	os_version: string;
	supervisor_version: string;
	update_pending: boolean;
	update_failed: boolean;
	update_downloaded: boolean;
	status?: string | null;
	commit?: string | null;
	download_progress?: string | null;
}

export interface BaseLog {
	message: string;
	createdAt: number;
	timestamp: number;
	isStdErr: boolean;
}

export interface ServiceLog extends BaseLog {
	isSystem: false;
	serviceId: number;
}

export interface SystemLog extends BaseLog {
	isSystem: true;
}

export type LogMessage = ServiceLog | SystemLog;

export interface LogsSubscription extends EventEmitter {
	unsubscribe(): void;
}

export interface LogsOptions {
	count?: number | 'all';
}

export interface ImgConfigOptions {
	network?: 'ethernet' | 'wifi';
	appUpdatePollInterval?: number;
	wifiKey?: string;
	wifiSsid?: string;
	ip?: string;
	gateway?: string;
	netmask?: string;
	deviceType?: string;
	version: string;
}

export interface OsVersions {
	latest: string;
	recommended: string;
	default: string;
	versions: string[];
}

export interface OsUpdateVersions {
	versions: string[];
	recommended: string | undefined;
	current: string | undefined;
}

export type OsLines = 'next' | 'current' | 'sunset' | 'outdated' | undefined;

export interface OsVersion {
	id: number;
	rawVersion: string;
	strippedVersion: string;
	basedOnVersion?: string;
	osType: string;
	line?: OsLines;
	variant?: string;

	formattedVersion: string;
	isRecommended?: boolean;
}

export interface OsVersionsByDeviceType {
	[deviceTypeSlug: string]: OsVersion[];
}

// See: https://github.com/balena-io/resin-proxy/issues/51#issuecomment-274251469
export interface OsUpdateActionResult {
	status: 'idle' | 'in_progress' | 'done' | 'error' | 'configuring';
	parameters?: {
		target_version: string;
	};
	error?: string;
	fatal?: boolean;
}

export interface BuilderUrlDeployOptions {
	url: string;
	shouldFlatten?: boolean;
}

export interface BalenaSDK {
	auth: {
		register: (credentials: {
			email: string;
			password: string;
			'g-recaptcha-response'?: string;
		}) => Promise<string>;
		authenticate: (credentials: {
			email: string;
			password: string;
		}) => Promise<string>;
		login: (credentials: { email: string; password: string }) => Promise<void>;
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
			getSetupKey: () => Promise<string>;
			enable: (code: string) => Promise<string>;
			disable: (password: string) => Promise<string>;
			challenge: (code: string) => Promise<void>;
			verify: (code: string) => Promise<string>;
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
				organization: number | string;
			}): Promise<Application>;
			get(
				nameOrSlugOrId: string | number,
				options?: PineOptions<Application>,
			): Promise<Application>;
			getWithDeviceServiceDetails(
				nameOrSlugOrId: string | number,
				options?: PineOptions<Application>,
			): Promise<
				Application & {
					owns__device: Array<
						DeviceWithServiceDetails<CurrentServiceWithCommit>
					>;
				}
			>;
			getAppByOwner(
				appName: string,
				owner: string,
				options?: PineOptions<Application>,
			): Promise<Application>;
			getAll(options?: PineOptions<Application>): Promise<Application[]>;
			getAllWithDeviceServiceDetails(
				options?: PineOptions<Application>,
			): Promise<
				Array<
					Application & {
						owns__device: Array<DeviceWithServiceDetails<CurrentService>>;
					}
				>
			>;
			has(nameOrSlugOrId: string | number): Promise<boolean>;
			hasAny(): Promise<boolean>;
			remove(nameOrSlugOrId: string | number): Promise<void>;
			rename(nameOrSlugOrId: string | number, newName: string): Promise<void>;
			restart(nameOrSlugOrId: string | number): Promise<void>;
			enableDeviceUrls(nameOrSlugOrId: string | number): Promise<void>;
			disableDeviceUrls(nameOrSlugOrId: string | number): Promise<void>;
			getDashboardUrl(id: number): string;
			grantSupportAccess(
				nameOrSlugOrId: string | number,
				expiryTimestamp: number,
			): Promise<void>;
			revokeSupportAccess(nameOrSlugOrId: string | number): Promise<void>;
			reboot(appId: number, options?: { force?: boolean }): Promise<void>;
			shutdown(appId: number, options?: { force?: boolean }): Promise<void>;
			purge(appId: number): Promise<void>;
			generateApiKey(nameOrSlugOrId: string | number): Promise<string>;
			generateProvisioningKey(nameOrSlugOrId: string | number): Promise<string>;
			willTrackNewReleases(nameOrSlugOrId: string | number): Promise<boolean>;
			isTrackingLatestRelease(
				nameOrSlugOrId: string | number,
			): Promise<boolean>;
			pinToRelease(
				nameOrSlugOrId: string | number,
				fullReleaseHash: string,
			): Promise<void>;
			getTargetReleaseHash(
				nameOrSlugOrId: string | number,
			): Promise<string | undefined>;
			trackLatestRelease(nameOrSlugOrId: string | number): Promise<void>;
			tags: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<ApplicationTag>,
				): Promise<ApplicationTag[]>;
				getAll(
					options?: PineOptions<ApplicationTag>,
				): Promise<ApplicationTag[]>;
				set(
					nameOrSlugOrId: string | number,
					tagKey: string,
					value: string,
				): Promise<void>;
				remove(nameOrSlugOrId: string | number, tagKey: string): Promise<void>;
			};
			configVar: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<ApplicationVariable>,
				): Promise<ApplicationVariable[]>;
				set(
					nameOrSlugOrId: string | number,
					key: string,
					value: string,
				): Promise<void>;
				get(
					nameOrSlugOrId: string | number,
					key: string,
				): Promise<string | undefined>;
				remove(nameOrSlugOrId: string | number, key: string): Promise<void>;
			};
			envVar: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<ApplicationVariable>,
				): Promise<ApplicationVariable[]>;
				set(
					nameOrSlugOrId: string | number,
					key: string,
					value: string,
				): Promise<void>;
				get(
					nameOrSlugOrId: string | number,
					key: string,
				): Promise<string | undefined>;
				remove(nameOrSlugOrId: string | number, key: string): Promise<void>;
			};
			buildVar: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<BuildVariable>,
				): Promise<BuildVariable[]>;
				set(
					nameOrSlugOrId: string | number,
					key: string,
					value: string,
				): Promise<void>;
				get(
					nameOrSlugOrId: string | number,
					key: string,
				): Promise<string | undefined>;
				remove(nameOrSlugOrId: string | number, key: string): Promise<void>;
			};
			invite: {
				create: (
					nameOrSlugOrId: string | number,
					options: ApplicationInviteOptions,
				) => Promise<ApplicationInvite>;
				getAllByApplication: (
					nameOrSlugOrId: string | number,
					options?: PineOptions<ApplicationInvite>,
				) => Promise<ApplicationInvite[]>;
				getAll: (
					options?: PineOptions<ApplicationInvite>,
				) => Promise<ApplicationInvite>;
				accept: (invitationToken: string) => Promise<void>;
				revoke: (id: number) => Promise<void>;
			};
		};
		apiKey: {
			create: (name: string, description?: string | null) => Promise<string>;
			getAll: (options?: PineOptions<ApiKey>) => Promise<ApiKey[]>;
			update: (
				id: number,
				apiKeyInfo: { name?: string; description?: string | null },
			) => Promise<void>;
			revoke: (id: number) => Promise<void>;
		};
		release: {
			get(
				commitOrId: string | number,
				options?: PineOptions<Release>,
			): Promise<Release>;
			getAllByApplication(
				nameOrSlugOrId: string | number,
				options?: PineOptions<Release>,
			): Promise<Release[]>;
			getLatestByApplication(
				nameOrSlugOrId: string | number,
				options?: PineOptions<Release>,
			): Promise<Release>;
			getWithImageDetails(
				commitOrId: string | number,
				options?: {
					release?: PineOptions<Release>;
					image?: PineOptions<Image>;
				},
			): Promise<ReleaseWithImageDetails>;
			createFromUrl(
				nameOrSlugOrId: string | number,
				urlDeployOptions: BuilderUrlDeployOptions,
			): Promise<number>;
			tags: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<ReleaseTag>,
				): Promise<ReleaseTag[]>;
				getAllByRelease(
					commitOrId: string | number,
					options?: PineOptions<ReleaseTag>,
				): Promise<ReleaseTag[]>;
				getAll(options?: PineOptions<ReleaseTag>): Promise<ReleaseTag[]>;
				set(
					commitOrReleaseId: string | number,
					tagKey: string,
					value: string,
				): Promise<void>;
				remove(
					commitOrReleaseId: string | number,
					tagKey: string,
				): Promise<void>;
			};
		};
		billing: {
			getAccount(organization: string | number): Promise<BillingAccountInfo>;
			getPlan(organization: string | number): Promise<BillingPlanInfo>;
			getBillingInfo(organization: string | number): Promise<BillingInfo>;
			updateBillingInfo(
				organization: string | number,
				billingInfo: TokenBillingSubmitInfo,
			): Promise<BillingInfo>;
			getInvoices(organization: string | number): Promise<InvoiceInfo[]>;
			downloadInvoice(
				organization: string | number,
				invoiceNumber: string,
			): Promise<Blob | BalenaRequestStreamResult>;
		};
		device: {
			get(
				uuidOrId: string | number,
				options?: PineOptions<Device>,
			): Promise<Device>;
			getByName(name: string, options?: PineOptions<Device>): Promise<Device[]>;
			getWithServiceDetails(
				uuidOrId: string | number,
				options?: PineOptions<Device>,
			): Promise<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
			getAll(options?: PineOptions<Device>): Promise<Device[]>;
			getAllByApplication(
				nameOrSlugOrId: string | number,
				options?: PineOptions<Device>,
			): Promise<Device[]>;
			getAllByParentDevice(
				parentUuidOrId: string | number,
				options?: PineOptions<Device>,
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
			getLocalIPAddresses(uuidOrId: string | number): Promise<string[]>;
			getMACAddresses(uuidOrId: string | number): Promise<string[]>;
			getMetrics(uuidOrId: string | number): Promise<DeviceMetrics>;
			getDashboardUrl(uuid: string): string;
			getSupportedDeviceTypes(): Promise<string[]>;
			getManifestBySlug(slugOrName: string): Promise<DeviceTypeJson.DeviceType>;
			getManifestByApplication(
				nameOrSlugOrId: string | number,
			): Promise<DeviceTypeJson.DeviceType>;
			move(
				uuidOrId: string | number,
				applicationNameOrSlugOrId: string | number,
			): Promise<void>;
			note(uuidOrId: string | number, note: string): Promise<void>;
			remove(uuidOrId: string | number): Promise<void>;
			deactivate(uuidOrId: string | number): Promise<void>;
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
			startService(uuidOrId: string | number, imageId: number): Promise<void>;
			stopService(uuidOrId: string | number, imageId: number): Promise<void>;
			restartService(uuidOrId: string | number, imageId: number): Promise<void>;
			grantSupportAccess(
				uuidOrId: string | number,
				expiryTimestamp: number,
			): Promise<void>;
			revokeSupportAccess(uuidOrId: string | number): Promise<void>;
			enableLocalMode(uuidOrId: string | number): Promise<void>;
			disableLocalMode(uuidOrId: string | number): Promise<void>;
			isInLocalMode(uuidOrId: string | number): Promise<boolean>;
			getLocalModeSupport(
				device: AtLeast<
					Device,
					| 'os_variant'
					| 'os_version'
					| 'supervisor_version'
					| 'last_connectivity_event'
				>,
			): {
				supported: boolean;
				message: string;
			};
			enableLockOverride(uuidOrId: string | number): Promise<void>;
			disableLockOverride(uuidOrId: string | number): Promise<void>;
			hasLockOverride(uuidOrId: string | number): Promise<boolean>;
			reboot(
				uuidOrId: string | number,
				options: { force?: boolean },
			): Promise<void>;
			shutdown(
				uuidOrId: string | number,
				options: { force?: boolean },
			): Promise<void>;
			purge(uuidOrId: string | number): Promise<void>;
			update(
				uuidOrId: string | number,
				options: { force?: boolean },
			): Promise<void>;
			getSupervisorState(uuidOrId: string | number): Promise<SupervisorStatus>;
			getSupervisorTargetState(
				uuidOrId: string | number,
			): Promise<DeviceState.DeviceState>;
			getDisplayName(deviceTypeSlug: string): Promise<string | undefined>;
			getDeviceSlug(deviceTypeName: string): Promise<string | undefined>;
			generateUniqueKey(): string;
			register(
				applicationNameOrSlugOrId: string | number,
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
			getStatus(uuidOrId: string | number): Promise<string>;
			getProgress(uuidOrId: string | number): Promise<number | null>;
			lastOnline(
				device: AtLeast<Device, 'last_connectivity_event' | 'is_online'>,
			): string;
			getOsVersion(
				device: AtLeast<Device, 'os_variant' | 'os_version'>,
			): string;
			isTrackingApplicationRelease(uuidOrId: string | number): Promise<boolean>;
			getTargetReleaseHash(uuidOrId: string | number): Promise<string>;
			pinToRelease(
				uuidOrId: string | number,
				fullReleaseHashOrId: string | number,
			): Promise<void>;
			setSupervisorRelease(
				uuidOrId: string | number,
				supervisorVersionOrId: string | number,
			): Promise<void>;
			trackApplicationRelease(uuidOrId: string | number): Promise<void>;
			startOsUpdate(
				uuid: string,
				targetOsVersion: string,
			): Promise<OsUpdateActionResult>;
			getOsUpdateStatus(uuid: string): Promise<OsUpdateActionResult>;
			tags: {
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<DeviceTag>,
				): Promise<DeviceTag[]>;
				getAllByDevice(
					uuidOrId: string | number,
					options?: PineOptions<DeviceTag>,
				): Promise<DeviceTag[]>;
				getAll(options?: PineOptions<DeviceTag>): Promise<DeviceTag[]>;
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
					options?: PineOptions<DeviceVariable>,
				): Promise<DeviceVariable[]>;
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<DeviceVariable>,
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
					options?: PineOptions<DeviceVariable>,
				): Promise<DeviceVariable[]>;
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<DeviceVariable>,
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
					options?: PineOptions<DeviceServiceEnvironmentVariable>,
				): Promise<DeviceServiceEnvironmentVariable[]>;
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<DeviceServiceEnvironmentVariable>,
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
			OverallStatus: typeof DeviceOverallStatus.DeviceOverallStatus;
		};
		service: {
			getAllByApplication(
				nameOrId: string | number,
				options?: PineOptions<Service>,
			): Promise<Service[]>;
			var: {
				getAllByService(
					id: number,
					options?: PineOptions<ServiceEnvironmentVariable>,
				): Promise<ServiceEnvironmentVariable[]>;
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptions<ServiceEnvironmentVariable>,
				): Promise<ServiceEnvironmentVariable[]>;
				set(id: number, key: string, value: string): Promise<void>;
				get(id: number, key: string): Promise<string | undefined>;
				remove(id: number, key: string): Promise<void>;
			};
		};
		config: {
			getAll: () => Promise<Config>;
			getDeviceTypes: () => Promise<DeviceTypeJson.DeviceType[]>;
			getDeviceOptions(
				deviceType: string,
			): Promise<
				Array<
					| DeviceTypeJson.DeviceTypeOptions
					| DeviceTypeJson.DeviceInitializationOptions
				>
			>;
		};
		image: {
			get(id: number, options?: PineOptions<Image>): Promise<Image>;
			getLogs(id: number): Promise<string>;
		};
		key: {
			getAll(options?: PineOptions<SSHKey>): Promise<SSHKey[]>;
			get(id: number): Promise<SSHKey>;
			remove(id: number): Promise<string>;
			create(title: string, key: string): Promise<SSHKey>;
		};
		organization: {
			create: (options: PineSubmitBody<Organization>) => Promise<Organization>;
			getAll: (options?: PineOptions<Organization>) => Promise<Organization[]>;
			get: (
				handleOrId: string | number,
				options?: PineOptions<Organization>,
			) => Promise<Organization>;
			remove: (handleOrId: string | number) => Promise<void>;
			membership: {
				get(
					membershipId: number,
					options?: PineOptions<OrganizationMembership>,
				): Promise<OrganizationMembership>;
				getAll(
					options?: PineOptions<OrganizationMembership>,
				): Promise<OrganizationMembership[]>;
				getAllByOrganization(
					handleOrId: string | number,
					options?: PineOptions<OrganizationMembership>,
				): Promise<OrganizationMembership[]>;
				tags: {
					getAllByOrganization(
						handleOrId: string | number,
						options?: PineOptions<OrganizationMembershipTag>,
					): Promise<OrganizationMembershipTag[]>;
					getAllByOrganizationMembership(
						membershipId: number,
						options?: PineOptions<OrganizationMembershipTag>,
					): Promise<OrganizationMembershipTag[]>;
					getAll(
						options?: PineOptions<OrganizationMembershipTag>,
					): Promise<OrganizationMembershipTag[]>;
					set(
						membershipId: number,
						tagKey: string,
						value: string,
					): Promise<void>;
					remove(membershipId: number, tagKey: string): Promise<void>;
				};
			};
			invite: {
				create: (
					handleOrId: string | number,
					options: OrganizationInviteOptions,
				) => Promise<OrganizationInvite>;
				getAllByOrganization: (
					handleOrId: string | number,
					options?: PineOptions<OrganizationInvite>,
				) => Promise<OrganizationInvite[]>;
				getAll: (
					options?: PineOptions<OrganizationInvite>,
				) => Promise<OrganizationInvite>;
				accept: (invitationToken: string) => Promise<void>;
				revoke: (id: number) => Promise<void>;
			};
		};

		hostapp: {
			OsTypes: typeof OsTypes.OsTypes;
			getAllOsVersions(deviceTypes: string[]): Promise<OsVersionsByDeviceType>;
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
			): Promise<string>;
			getLastModified(deviceType: string, version?: string): Promise<Date>;
			download(
				deviceType: string,
				version?: string,
			): Promise<BalenaRequestStreamResult>;
			isSupportedOsUpdate(
				deviceType: string,
				currentVersion: string,
				targetVersion: string,
			): Promise<boolean>;
			getSupportedOsUpdateVersions(
				deviceType: string,
				currentVersion: string,
			): Promise<OsUpdateVersions>;
			isArchitectureCompatibleWith(
				osArchitecture: string,
				applicationArchitecture: string,
			): boolean;
		};
	};

	logs: {
		history(
			uuidOrId: string | number,
			options?: LogsOptions,
		): Promise<LogMessage[]>;
		subscribe(
			uuidOrId: string | number,
			options?: LogsOptions,
		): Promise<LogsSubscription>;
	};

	pine: BalenaPine.Pine;

	interceptors: Interceptor[];

	version: string;
}

export interface SdkOptions {
	apiUrl?: string;
	builderUrl?: string;
	dashboardUrl?: string;
	dataDirectory?: string;
	isBrowser?: boolean;
	debug?: boolean;
	deviceUrlsBase?: string;
}

export type SdkConstructor = (options?: SdkOptions) => BalenaSDK;

declare const getSdk: SdkConstructor;
declare const setSharedOptions: (options: SdkOptions) => void;
declare const fromSharedOptions: () => BalenaSDK;

export { getSdk, setSharedOptions, fromSharedOptions };
// As generated by browserify
export as namespace balenaSdk;
