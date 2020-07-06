import type * as BalenaErrors from 'balena-errors';
import type * as Bluebird from 'bluebird';
import type { EventEmitter } from 'events';

import type * as BalenaPine from '../balena-pine';
import type {
	BalenaRequest,
	BalenaRequestStreamResult,
} from '../balena-request';
import type * as DeviceOverallStatus from './device-overall-status';
import type * as Pine from '../pinejs-client-core';
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
		request?(response: any): Bluebird<any>;
		response?(response: any): Bluebird<any>;
		requestError?(error: Error): Bluebird<any>;
		responseError?(error: Error): Bluebird<any>;
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
			}) => Bluebird<string>;
			authenticate: (credentials: {
				email: string;
				password: string;
			}) => Bluebird<string>;
			login: (credentials: {
				email: string;
				password: string;
			}) => Bluebird<void>;
			loginWithToken: (authToken: string) => Bluebird<void>;
			logout: () => Bluebird<void>;
			getToken: () => Bluebird<string>;
			whoami: () => Bluebird<string | undefined>;
			isLoggedIn: () => Bluebird<boolean>;
			getUserId: () => Bluebird<number>;
			getEmail: () => Bluebird<string>;

			twoFactor: {
				isEnabled: () => Bluebird<boolean>;
				isPassed: () => Bluebird<boolean>;
				challenge: (code: string) => Bluebird<void>;
			};
		};

		settings: {
			get(key: string): Bluebird<string>;
			getAll(): Bluebird<{ [key: string]: string }>;
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
				}): Bluebird<Application>;
				get(
					nameOrId: string | number,
					options?: PineOptions<Application>,
				): Bluebird<Application>;
				getWithDeviceServiceDetails(
					nameOrId: string | number,
					options?: PineOptions<Application>,
				): Bluebird<
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
				): Bluebird<Application>;
				getAll(options?: PineOptions<Application>): Bluebird<Application[]>;
				getAllWithDeviceServiceDetails(
					options?: PineOptions<Application>,
				): Bluebird<
					Array<
						Application & {
							owns__device: Array<DeviceWithServiceDetails<CurrentService>>;
						}
					>
				>;
				has(nameOrId: string | number): Bluebird<boolean>;
				hasAny(): Bluebird<boolean>;
				remove(nameOrId: string | number): Bluebird<void>;
				restart(nameOrId: string | number): Bluebird<void>;
				enableDeviceUrls(nameOrId: string | number): Bluebird<void>;
				disableDeviceUrls(nameOrId: string | number): Bluebird<void>;
				grantSupportAccess(
					nameOrId: string | number,
					expiryTimestamp: number,
				): Bluebird<void>;
				revokeSupportAccess(nameOrId: string | number): Bluebird<void>;
				reboot(appId: number, { force }: { force?: boolean }): Bluebird<void>;
				shutdown(appId: number, { force }: { force?: boolean }): Bluebird<void>;
				purge(appId: number): Bluebird<void>;
				generateApiKey(nameOrId: string | number): Bluebird<string>;
				generateProvisioningKey(nameOrId: string | number): Bluebird<string>;
				willTrackNewReleases(nameOrId: string | number): Bluebird<boolean>;
				isTrackingLatestRelease(nameOrId: string | number): Bluebird<boolean>;
				pinToRelease(
					nameOrId: string | number,
					fullReleaseHash: string,
				): Bluebird<void>;
				getTargetReleaseHash(nameOrId: string | number): Bluebird<string>;
				trackLatestRelease(nameOrId: string | number): Bluebird<void>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<ApplicationTag>,
					): Bluebird<ApplicationTag[]>;
					getAll(
						options?: PineOptions<ApplicationTag>,
					): Bluebird<ApplicationTag[]>;
					set(
						nameOrId: string | number,
						tagKey: string,
						value: string,
					): Bluebird<void>;
					remove(nameOrId: string | number, tagKey: string): Bluebird<void>;
				};
				configVar: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<ApplicationVariable>,
					): Bluebird<ApplicationVariable[]>;
					set(
						nameOrId: string | number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						nameOrId: string | number,
						key: string,
					): Bluebird<string | undefined>;
					remove(nameOrId: string | number, key: string): Bluebird<void>;
				};
				envVar: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<ApplicationVariable>,
					): Bluebird<ApplicationVariable[]>;
					set(
						nameOrId: string | number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						nameOrId: string | number,
						key: string,
					): Bluebird<string | undefined>;
					remove(nameOrId: string | number, key: string): Bluebird<void>;
				};
				buildVar: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<BuildVariable>,
					): Bluebird<BuildVariable[]>;
					set(
						nameOrId: string | number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						nameOrId: string | number,
						key: string,
					): Bluebird<string | undefined>;
					remove(nameOrId: string | number, key: string): Bluebird<void>;
				};
				invite: {
					create: (
						nameOrSlugOrId: string | number,
						options: ApplicationInviteOptions,
					) => Bluebird<ApplicationInvite>;
					getAllByApplication: (
						nameOrSlugOrId: string | number,
						options?: PineOptions<ApplicationInvite>,
					) => Bluebird<ApplicationInvite[]>;
					getAll: (
						options?: PineOptions<ApplicationInvite>,
					) => Bluebird<ApplicationInvite>;
					accept: (invitationToken: string) => Bluebird<void>;
					revoke: (id: number) => Bluebird<void>;
				};
			};
			apiKey: {
				create: (name: string, description?: string | null) => Bluebird<string>;
				getAll: (options?: PineOptions<ApiKey>) => Bluebird<ApiKey[]>;
				update: (
					id: number,
					apiKeyInfo: { name?: string; description?: string | null },
				) => Bluebird<void>;
				revoke: (id: number) => Bluebird<void>;
			};
			release: {
				get(
					commitOrId: string | number,
					options?: PineOptions<Release>,
				): Bluebird<Release>;
				getAllByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<Release>,
				): Bluebird<Release[]>;
				getLatestByApplication(
					nameOrSlugOrId: string | number,
					options?: PineOptions<Release>,
				): Bluebird<Release>;
				getWithImageDetails(
					commitOrId: string | number,
					options?: {
						release?: PineOptions<Release>;
						image?: PineOptions<Image>;
					},
				): Bluebird<ReleaseWithImageDetails>;
				createFromUrl(
					nameOrSlugOrId: string | number,
					urlDeployOptions: BuilderUrlDeployOptions,
				): Bluebird<number>;
				tags: {
					getAllByApplication(
						nameOrSlugOrId: string | number,
						options?: PineOptions<ReleaseTag>,
					): Bluebird<ReleaseTag[]>;
					getAllByRelease(
						commitOrId: string | number,
						options?: PineOptions<ReleaseTag>,
					): Bluebird<ReleaseTag[]>;
					getAll(options?: PineOptions<ReleaseTag>): Bluebird<ReleaseTag[]>;
					set(
						commitOrReleaseId: string | number,
						tagKey: string,
						value: string,
					): Bluebird<void>;
					remove(
						commitOrReleaseId: string | number,
						tagKey: string,
					): Bluebird<void>;
				};
			};
			billing: {
				getAccount(): Bluebird<BillingAccountInfo>;
				getPlan(): Bluebird<BillingPlanInfo>;
				getBillingInfo(): Bluebird<BillingInfo>;
				updateBillingInfo(
					billingInfo: TokenBillingSubmitInfo,
				): Bluebird<BillingInfo>;
				getInvoices(): Bluebird<InvoiceInfo[]>;
				downloadInvoice(
					invoiceNumber: string,
				): Bluebird<Blob | BalenaRequestStreamResult>;
			};
			device: {
				get(
					uuidOrId: string | number,
					options?: PineOptions<Device>,
				): Bluebird<Device>;
				getByName(
					nameOrId: string | number,
					options?: PineOptions<Device>,
				): Bluebird<Device[]>;
				getWithServiceDetails(
					nameOrId: string | number,
					options?: PineOptions<Device>,
				): Bluebird<DeviceWithServiceDetails<CurrentServiceWithCommit>>;
				getAll(options?: PineOptions<Device>): Bluebird<Device[]>;
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptions<Device>,
				): Bluebird<Device[]>;
				getAllByParentDevice(
					parentUuidOrId: string | number,
					options?: PineOptions<Device>,
				): Bluebird<Device[]>;
				getName(uuidOrId: string | number): Bluebird<string>;
				getApplicationName(uuidOrId: string | number): Bluebird<string>;
				getApplicationInfo(
					uuidOrId: string | number,
				): Bluebird<{
					appId: string;
					commit: string;
					containerId: string;
					env: { [key: string]: string | number };
					imageId: string;
				}>;
				has(uuidOrId: string | number): Bluebird<boolean>;
				isOnline(uuidOrId: string | number): Bluebird<boolean>;
				getLocalIPAddressess(uuidOrId: string | number): Bluebird<string[]>;
				getMACAddressess(uuidOrId: string | number): Bluebird<string[]>;
				getDashboardUrl(uuid: string): string;
				getSupportedDeviceTypes(): Bluebird<string[]>;
				getManifestBySlug(
					slugOrName: string,
				): Bluebird<DeviceTypeJson.DeviceType>;
				getManifestByApplication(
					nameOrId: string | number,
				): Bluebird<DeviceTypeJson.DeviceType>;
				move(
					uuidOrId: string | number,
					applicationNameOrId: string | number,
				): Bluebird<void>;
				note(uuidOrId: string | number, note: string): Bluebird<void>;
				remove(uuidOrId: string | number): Bluebird<void>;
				rename(uuidOrId: string | number, newName: string): Bluebird<void>;
				setCustomLocation(
					uuidOrId: string | number,
					location: { latitude: number; longitude: number },
				): Bluebird<void>;
				unsetCustomLocation(uuidOrId: string | number): Bluebird<void>;
				identify(uuidOrId: string | number): Bluebird<void>;
				startApplication(uuidOrId: string | number): Bluebird<void>;
				stopApplication(uuidOrId: string | number): Bluebird<void>;
				restartApplication(uuidOrId: string | number): Bluebird<void>;
				startService(
					uuidOrId: string | number,
					imageId: number,
				): Bluebird<void>;
				stopService(uuidOrId: string | number, imageId: number): Bluebird<void>;
				restartService(
					uuidOrId: string | number,
					imageId: number,
				): Bluebird<void>;
				grantSupportAccess(
					uuidOrId: string | number,
					expiryTimestamp: number,
				): Bluebird<void>;
				revokeSupportAccess(uuidOrId: string | number): Bluebird<void>;
				enableLocalMode(uuidOrId: string | number): Bluebird<void>;
				disableLocalMode(uuidOrId: string | number): Bluebird<void>;
				isInLocalMode(uuidOrId: string | number): Bluebird<boolean>;
				getLocalModeSupport(
					devive: Device,
				): {
					supported: boolean;
					message: string;
				};
				enableLockOverride(uuidOrId: string | number): Bluebird<void>;
				disableLockOverride(uuidOrId: string | number): Bluebird<void>;
				hasLockOverride(uuidOrId: string | number): Bluebird<boolean>;
				reboot(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Bluebird<void>;
				shutdown(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Bluebird<void>;
				purge(uuidOrId: string | number): Bluebird<void>;
				update(
					uuidOrId: string | number,
					{ force }: { force?: boolean },
				): Bluebird<void>;
				getSupervisorState(
					uuidOrId: string | number,
				): Bluebird<SupervisorStatus>;
				getSupervisorTargetState(
					uuidOrId: string | number,
				): Bluebird<DeviceState.DeviceState>;
				getDisplayName(deviceTypeName: string): Bluebird<string>;
				getDeviceSlug(deviceTypeName: string): Bluebird<string>;
				generateUniqueKey(): string;
				register(
					applicationNameOrId: string | number,
					uuid: string,
				): Bluebird<{
					id: number;
					uuid: string;
					api_key: string;
				}>;
				generateDeviceKey(uuidOrId: string | number): Bluebird<string>;
				enableDeviceUrl(uuidOrId: string | number): Bluebird<void>;
				disableDeviceUrl(uuidOrId: string | number): Bluebird<void>;
				hasDeviceUrl(uuidOrId: string | number): Bluebird<boolean>;
				getDeviceUrl(uuidOrId: string | number): Bluebird<string>;
				enableTcpPing(uuidOrId: string | number): Bluebird<void>;
				disableTcpPing(uuidOrId: string | number): Bluebird<void>;
				ping(uuidOrId: string | number): Bluebird<void>;
				getStatus(uuidOrId: string | number): Bluebird<string>;
				getProgress(uuidOrId: string | number): Bluebird<number | null>;
				lastOnline(device: Device): string;
				getOsVersion(device: Device): string;
				isTrackingApplicationRelease(
					uuidOrId: string | number,
				): Bluebird<boolean>;
				getTargetReleaseHash(uuidOrId: string | number): Bluebird<string>;
				pinToRelease(
					uuidOrId: string | number,
					fullReleaseHashOrId: string | number,
				): Bluebird<void>;
				trackApplicationRelease(uuidOrId: string | number): Bluebird<void>;
				startOsUpdate(
					uuid: string,
					targetOsVersion: string,
				): Bluebird<OsUpdateActionResult>;
				getOsUpdateStatus(uuid: string): Bluebird<OsUpdateActionResult>;
				tags: {
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<DeviceTag>,
					): Bluebird<DeviceTag[]>;
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptions<DeviceTag>,
					): Bluebird<DeviceTag[]>;
					getAll(options?: PineOptions<DeviceTag>): Bluebird<DeviceTag[]>;
					set(
						uuidOrId: string | number,
						tagKey: string,
						value: string,
					): Bluebird<void>;
					remove(uuidOrId: string | number, tagKey: string): Bluebird<void>;
				};
				configVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptions<DeviceVariable>,
					): Bluebird<DeviceVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<DeviceVariable>,
					): Bluebird<DeviceVariable[]>;
					set(
						uuidOrId: string | number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						uuidOrId: string | number,
						key: string,
					): Bluebird<string | undefined>;
					remove(uuidOrId: string | number, key: string): Bluebird<void>;
				};
				envVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptions<DeviceVariable>,
					): Bluebird<DeviceVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<DeviceVariable>,
					): Bluebird<DeviceVariable[]>;
					set(
						uuidOrId: string | number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						uuidOrId: string | number,
						key: string,
					): Bluebird<string | undefined>;
					remove(uuidOrId: string | number, key: string): Bluebird<void>;
				};
				serviceVar: {
					getAllByDevice(
						uuidOrId: string | number,
						options?: PineOptions<DeviceServiceEnvironmentVariable>,
					): Bluebird<DeviceServiceEnvironmentVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<DeviceServiceEnvironmentVariable>,
					): Bluebird<DeviceServiceEnvironmentVariable[]>;
					set(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
						value: string,
					): Bluebird<void>;
					get(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
					): Bluebird<string | undefined>;
					remove(
						uuidOrId: string | number,
						serviceId: number,
						key: string,
					): Bluebird<void>;
				};
				OverallStatus: typeof DeviceOverallStatus.DeviceOverallStatus;
			};
			service: {
				getAllByApplication(
					nameOrId: string | number,
					options?: PineOptions<Service>,
				): Bluebird<Service[]>;
				var: {
					getAllByService(
						id: number,
						options?: PineOptions<ServiceEnvironmentVariable>,
					): Bluebird<ServiceEnvironmentVariable[]>;
					getAllByApplication(
						nameOrId: string | number,
						options?: PineOptions<ServiceEnvironmentVariable>,
					): Bluebird<ServiceEnvironmentVariable[]>;
					set(id: number, key: string, value: string): Bluebird<void>;
					get(id: number, key: string): Bluebird<string | undefined>;
					remove(id: number, key: string): Bluebird<void>;
				};
			};
			config: {
				getAll: () => Bluebird<Config>;
				getDeviceTypes: () => Bluebird<DeviceTypeJson.DeviceType[]>;
				getDeviceOptions(
					deviceType: string,
				): Bluebird<
					Array<
						| DeviceTypeJson.DeviceTypeOptions
						| DeviceTypeJson.DeviceInitializationOptions
					>
				>;
			};
			image: {
				get(id: number, options?: PineOptions<Image>): Bluebird<Image>;
				getLogs(id: number): Bluebird<string>;
			};
			key: {
				getAll(options?: PineOptions<SSHKey>): Bluebird<SSHKey[]>;
				get(id: number): Bluebird<SSHKey>;
				remove(id: number): Bluebird<string>;
				create(title: string, key: string): Bluebird<SSHKey>;
			};
			organization: {
				create: (
					options: PineSubmitBody<Organization>,
				) => Bluebird<Organization>;
				getAll: (
					options?: PineOptions<Organization>,
				) => Bluebird<Organization[]>;
				get: (
					handleOrId: string | number,
					options?: PineOptions<Organization>,
				) => Bluebird<Organization>;
				remove: (handleOrId: string | number) => Bluebird<void>;
			};
			os: {
				getConfig(
					nameOrId: string | number,
					options: ImgConfigOptions,
				): Bluebird<object>;
				getDownloadSize(slug: string, version?: string): Bluebird<number>;
				getSupportedVersions(slug: string): Bluebird<OsVersions>;
				getMaxSatisfyingVersion(
					deviceType: string,
					versionOrRange: string,
				): Bluebird<string>;
				getLastModified(deviceType: string, version?: string): Bluebird<Date>;
				download(
					deviceType: string,
					version?: string,
				): Bluebird<BalenaRequestStreamResult>;
				isSupportedOsUpdate(
					deviceType: string,
					currentVersion: string,
					targetVersion: string,
				): Bluebird<boolean>;
				getSupportedOsUpdateVersions(
					deviceType: string,
					currentVersion: string,
				): Bluebird<OsUpdateVersions>;
				isArchitectureCompatibleWith(
					osArchitecture: string,
					applicationArchitecture: string,
				): boolean;
			};
		};

		logs: {
			history(uuid: string, options?: LogsOptions): Bluebird<LogMessage[]>;
			subscribe(
				uuid: string,
				options?: LogsOptions,
			): Bluebird<LogsSubscription>;
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
