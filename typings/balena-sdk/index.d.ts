import * as BalenaErrors from 'balena-errors';
import * as Promise from 'bluebird';
import { EventEmitter } from 'events';

import { Readable } from 'stream';

import * as BalenaPine from '../balena-pine';
import { BalenaRequest, BalenaRequestStreamResult } from '../balena-request';
import * as DeviceOverallStatus from './device-overall-status';
import * as Pine from '../pinejs-client-core';
import { Dictionary } from '../utils';
import './device-state';
import './device-type-json';
import './models';

// tslint:disable-next-line:no-namespace
declare namespace BalenaSdk {
	type WithId = Pine.WithId;
	type PineDeferred = Pine.PineDeferred;

	/**
	 * When not selected-out holds a deferred.
	 * When expanded hold an array with a single element.
	 */
	type NavigationResource<T = WithId> = Pine.NavigationResource<T>;
	type OptionalNavigationResource<T = WithId> = Pine.OptionalNavigationResource<
		T
	>;
	/**
	 * When expanded holds an array, otherwise the property is not present.
	 * Selecting is not suggested,
	 * in that case it holds a deferred to the original resource.
	 */
	type ReverseNavigationResource<T = WithId> = Pine.ReverseNavigationResource<
		T
	>;
	type PineFilter<T> = Pine.Filter<T>;
	type PineExpand<T> = Pine.Expand<T>;
	type PineOptions<T> = Pine.ODataOptions<T>;
	type PineOptionsWithSelect<T> = Pine.ODataOptionsWithSelect<T>;
	type PineOptionsWithFilter<T> = Pine.ODataOptionsWithFilter<T>;
	type PineSubmitBody<T> = Pine.SubmitBody<T>;
	type PineParams<T> = Pine.ParamsObj<T>;
	type PineParamsWithId<T> = Pine.ParamsObjWithId<T>;
	type PineSelectableProps<T> = Pine.SelectableProps<T>;
	type PineExpandableProps<T> = Pine.ExpandableProps<T>;

	interface Interceptor {
		request?(response: any): Promise<any>;
		response?(response: any): Promise<any>;
		requestError?(error: Error): Promise<any>;
		responseError?(error: Error): Promise<any>;
	}

	/* types for the /config endppoint */
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
		deviceTypes: DeviceTypeJson.DeviceType[];
		DEVICE_ONLINE_ICON: string;
		DEVICE_OFFLINE_ICON: string;
		signupCodeRequired: boolean;
		supportedSocialProviders: string[];
	}

	interface GaConfig {
		site: string;
		id: string;
	}

	/* types for the DeviceWithServiceDetails objects */
	interface CurrentService {
		id: number;
		image_id: number;
		service_id: number;
		download_progress: number;
		status: string;
		install_date: string;
	}

	interface CurrentServiceWithCommit extends CurrentService {
		commit: string;
	}

	interface CurrentGatewayDownload {
		id: number;
		image_id: number;
		service_id: number;
		download_progress: number;
		status: string;
	}

	interface DeviceWithServiceDetails<
		TCurrentService extends CurrentService = CurrentService
	> extends Device {
		current_services: {
			[serviceName: string]: TCurrentService[];
		};

		current_gateway_downloads: CurrentGatewayDownload[];
	}

	interface ApplicationInviteOptions {
		invitee: string;
		roleName?: ApplicationMembershipRoles;
		message?: string;
	}

	interface ReleaseWithImageDetails extends Release {
		images: Array<{
			id: number;
			service_name: string;
		}>;
		user: User;
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
		'g-recaptcha-response'?: string;
	}

	interface BillingPlanInfo {
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

	interface SupervisorStatus {
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

	interface BaseLog {
		message: string;
		createdAt: number;
		timestamp: number;
		isStdErr: boolean;
	}

	interface ServiceLog extends BaseLog {
		isSystem: false;
		serviceId: number;
	}

	interface SystemLog extends BaseLog {
		isSystem: true;
	}

	type LogMessage = ServiceLog | SystemLog;

	interface LogsSubscription extends EventEmitter {
		unsubscribe(): void;
	}

	interface LogsOptions {
		count?: number | 'all';
	}

	interface ImgConfigOptions {
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

	interface OsVersions {
		latest: string;
		recommended: string;
		default: string;
		versions: string[];
	}

	interface OsUpdateVersions {
		versions: string[];
		recommended: string | undefined;
		current: string | undefined;
	}

	// See: https://github.com/balena-io/resin-proxy/issues/51#issuecomment-274251469
	interface OsUpdateActionResult {
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

	interface BalenaSDK {
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
			login: (credentials: {
				email: string;
				password: string;
			}) => Promise<void>;
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
					organization: number | string;
				}): Promise<Application>;
				get(
					nameOrId: string | number,
					options?: PineOptions<Application>,
				): Promise<Application>;
				getWithDeviceServiceDetails(
					nameOrId: string | number,
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
						options?: PineOptions<ApplicationTag>,
					): Promise<ApplicationTag[]>;
					getAll(
						options?: PineOptions<ApplicationTag>,
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
						options?: PineOptions<ApplicationVariable>,
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
						options?: PineOptions<ApplicationVariable>,
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
				getAccount(): Promise<BillingAccountInfo>;
				getPlan(): Promise<BillingPlanInfo>;
				getBillingInfo(): Promise<BillingInfo>;
				updateBillingInfo(
					billingInfo: TokenBillingSubmitInfo,
				): Promise<BillingInfo>;
				getInvoices(): Promise<InvoiceInfo[]>;
				downloadInvoice(
					invoiceNumber: string,
				): Promise<Blob | BalenaRequestStreamResult>;
			};
			device: {
				get(
					uuidOrId: string | number,
					options?: PineOptions<Device>,
				): Promise<Device>;
				getByName(
					nameOrId: string | number,
					options?: PineOptions<Device>,
				): Promise<Device[]>;
				getWithServiceDetails(
					nameOrId: string | number,
					options?: PineOptions<Device>,
				): Promise<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
				getAll(options?: PineOptions<Device>): Promise<Device[]>;
				getAllByApplication(
					nameOrId: string | number,
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
				getLocalIPAddressess(uuidOrId: string | number): Promise<string[]>;
				getMACAddressess(uuidOrId: string | number): Promise<string[]>;
				getDashboardUrl(uuid: string): string;
				getSupportedDeviceTypes(): Promise<string[]>;
				getManifestBySlug(
					slugOrName: string,
				): Promise<DeviceTypeJson.DeviceType>;
				getManifestByApplication(
					nameOrId: string | number,
				): Promise<DeviceTypeJson.DeviceType>;
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
				startService(uuidOrId: string | number, imageId: number): Promise<void>;
				stopService(uuidOrId: string | number, imageId: number): Promise<void>;
				restartService(
					uuidOrId: string | number,
					imageId: number,
				): Promise<void>;
				grantSupportAccess(
					uuidOrId: string | number,
					expiryTimestamp: number,
				): Promise<void>;
				revokeSupportAccess(uuidOrId: string | number): Promise<void>;
				enableLocalMode(uuidOrId: string | number): Promise<void>;
				disableLocalMode(uuidOrId: string | number): Promise<void>;
				isInLocalMode(uuidOrId: string | number): Promise<boolean>;
				getLocalModeSupport(
					devive: Device,
				): {
					supported: boolean;
					message: string;
				};
				enableLockOverride(uuidOrId: string | number): Promise<void>;
				disableLockOverride(uuidOrId: string | number): Promise<void>;
				hasLockOverride(uuidOrId: string | number): Promise<boolean>;
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
				getSupervisorState(
					uuidOrId: string | number,
				): Promise<SupervisorStatus>;
				getSupervisorTargetState(
					uuidOrId: string | number,
				): Promise<DeviceState.DeviceState>;
				getDisplayName(deviceTypeName: string): Promise<string>;
				getDeviceSlug(deviceTypeName: string): Promise<string>;
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
				getStatus(uuidOrId: string | number): Promise<string>;
				getProgress(uuidOrId: string | number): Promise<number | null>;
				lastOnline(device: Device): string;
				getOsVersion(device: Device): string;
				isTrackingApplicationRelease(
					uuidOrId: string | number,
				): Promise<boolean>;
				getTargetReleaseHash(uuidOrId: string | number): Promise<string>;
				pinToRelease(
					uuidOrId: string | number,
					fullReleaseHashOrId: string | number,
				): Promise<void>;
				trackApplicationRelease(uuidOrId: string | number): Promise<void>;
				startOsUpdate(
					uuid: string,
					targetOsVersion: string,
				): Promise<OsUpdateActionResult>;
				getOsUpdateStatus(uuid: string): Promise<OsUpdateActionResult>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
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
						nameOrId: string | number,
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
						nameOrId: string | number,
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
						nameOrId: string | number,
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
				create: (
					options: PineSubmitBody<Organization>,
				) => Promise<Organization>;
				getAll: (
					options?: PineOptions<Organization>,
				) => Promise<Organization[]>;
				get: (
					handleOrId: string | number,
					options?: PineOptions<Organization>,
				) => Promise<Organization>;
				remove: (handleOrId: string | number) => Promise<void>;
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
			history(uuid: string, options?: LogsOptions): Promise<LogMessage[]>;
			subscribe(uuid: string, options?: LogsOptions): Promise<LogsSubscription>;
		};

		pine: BalenaPine.Pine;

		interceptors: Interceptor[];

		version: string;
	}

	interface SdkOptions {
		apiUrl?: string;
		builderUrl?: string;
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
