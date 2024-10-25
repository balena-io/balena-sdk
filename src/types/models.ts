import type { DeviceOverallStatus } from './device-overall-status';
export type { DeviceOverallStatus } from './device-overall-status';
import type { Contract } from './contract';
import type {
	NavigationResource,
	OptionalNavigationResource,
	ReverseNavigationResource,
	ConceptTypeNavigationResource,
	WebResource,
} from '../../typings/pinejs-client-core';
import type { AnyObject } from '../../typings/utils';

type JsonType = AnyObject;

export interface ResourceTypeMap {
	actor: Actor;
	api_key: ApiKey;
	application: Application;
	application__can_use__application_as_host: ApplicationHostedOnApplication;
	application_config_variable: ApplicationVariable;
	application_environment_variable: ApplicationVariable;
	application_membership_role: ApplicationMembershipRole;
	application_tag: ApplicationTag;
	application_type: ApplicationType;
	build_environment_variable: BuildVariable;
	cpu_architecture: CpuArchitecture;
	credit_bundle: CreditBundle;
	device: Device;
	device_config_variable: DeviceVariable;
	device_environment_variable: DeviceVariable;
	device_history: DeviceHistory;
	device_service_environment_variable: DeviceServiceEnvironmentVariable;
	device_tag: DeviceTag;
	device_type: DeviceType;
	device_type_alias: DeviceTypeAlias;
	feature: Feature;
	image: Image;
	image_install: ImageInstall;
	identity_provider: IdentityProvider;
	identity_provider_membership: IdentityProviderMembership;
	invitee: Invitee;
	invitee__is_invited_to__application: ApplicationInvite;
	invitee__is_invited_to__organization: OrganizationInvite;
	organization: Organization;
	organization__has_private_access_to__device_type: OrganizationPrivateDeviceTypeAccess;
	organization_credit_notification: OrganizationCreditNotification;
	organization_membership: OrganizationMembership;
	organization_membership_role: OrganizationMembershipRole;
	organization_membership_tag: OrganizationMembershipTag;
	plan: Plan;
	plan__has__discount_code: PlanDiscountCode;
	plan_addon: PlanAddon;
	plan_feature: PlanFeature;
	public_organization: PublicOrganization;
	public_device: PublicDevice;
	recovery_two_factor: RecoveryTwoFactor;
	release: Release;
	release_tag: ReleaseTag;
	saml_account: SamlAccount;
	service: Service;
	service_environment_variable: ServiceEnvironmentVariable;
	service_install: ServiceInstall;
	service_instance: ServiceInstance;
	social_service_account: SocialServiceAccount;
	subscription: Subscription;
	subscription_addon_discount: SubscriptionAddonDiscount;
	subscription_prepaid_addon: SubscriptionPrepaidAddon;
	support_feature: SupportFeature;
	support_tier: SupportTier;
	team: Team;
	team_application_access: TeamApplicationAccess;
	team_membership: TeamMembership;
	user: User;
	user_profile: UserProfile;
	user__has__public_key: SSHKey;
	user__has_direct_access_to__application: UserHasDirectAccessToApplication;
	user_application_membership: ApplicationMembership;
}

export interface Organization {
	id: number;
	created_at: string;
	name: string;
	handle: string;
	has_past_due_invoice_since__date: string | null;
	is_frozen: boolean;
	is_using__billing_version: 'v1' | 'v2';
	logo_image: WebResource;

	application?: ReverseNavigationResource<Application>;
	/** includes__organization_membership */
	organization_membership?: ReverseNavigationResource<OrganizationMembership>;
	owns__credit_bundle?: ReverseNavigationResource<CreditBundle>;
	owns__team?: ReverseNavigationResource<Team>;
	organization__has_private_access_to__device_type?: ReverseNavigationResource<OrganizationPrivateDeviceTypeAccess>;
	organization_credit_notification?: ReverseNavigationResource<OrganizationCreditNotification>;
	identity_provider_membership?: ReverseNavigationResource<IdentityProviderMembership>;
}

export interface OrganizationCreditNotification {
	id: number;
	created_at: string;
	is_sent_when_below__threshold: number;
	organization: NavigationResource<Organization>;
	owns_credit_notification_for__feature: NavigationResource<Feature>;
}

export interface Team {
	id: number;
	created_at: string;
	name: string;

	belongs_to__organization: NavigationResource<Organization>;

	/** includes__user */
	team_membership?: ReverseNavigationResource<TeamMembership>;
	/** grants_access_to__application */
	team_application_access?: ReverseNavigationResource<TeamApplicationAccess>;
}

export interface RecoveryTwoFactor {
	id: number;
	used_timestamp: string | null;

	belongs_to__user: NavigationResource<User>;
}

export interface Actor {
	id: number;

	is_of__user?: OptionalNavigationResource<User>;
	is_of__application?: OptionalNavigationResource<Application>;
	is_of__device?: OptionalNavigationResource<Device>;
	is_of__public_device?: OptionalNavigationResource<PublicDevice>;
	api_key?: OptionalNavigationResource<ApiKey>;
}

export interface User {
	id: number;
	actor: ConceptTypeNavigationResource<Actor>;
	created_at: string;
	username: string;

	organization_membership?: ReverseNavigationResource<OrganizationMembership>;
	user_application_membership?: ReverseNavigationResource<ApplicationMembership>;
	team_membership?: ReverseNavigationResource<TeamMembership>;
	has_direct_access_to__application?: ReverseNavigationResource<Application>;
	user_profile?: ReverseNavigationResource<UserProfile>;
}

export interface UserProfile {
	id: number;
	email: string | null;
	first_name: string | null;
	last_name: string | null;
	company: string;
	account_type: string | null;
	has_disabled_newsletter: boolean;
	has_password_set: boolean;
	must_be_verified: boolean;
	is_verified: boolean;

	is_of__user: NavigationResource<User>;
}

export type OrganizationMembershipRoles = 'administrator' | 'member';

export interface OrganizationMembershipRole {
	id: number;
	name: OrganizationMembershipRoles;
}

export interface OrganizationMembership {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** organization */
	is_member_of__organization: NavigationResource<Organization>;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	effective_seat_role: string;

	organization_membership_tag?: ReverseNavigationResource<OrganizationMembershipTag>;
}

export interface TeamMembership {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** team */
	is_member_of__team: NavigationResource<Team>;
}

export interface ApiKey {
	id: number;
	created_at: string;
	name: string;
	description: string | null;
	expiry_date: string | null;

	is_of__actor: NavigationResource<Actor>;
}

export interface Application {
	id: number;
	created_at: string;
	app_name: string;
	actor: ConceptTypeNavigationResource<Actor>;
	slug: string;
	uuid: string;
	is_accessible_by_support_until__date: string;
	is_host: boolean;
	should_track_latest_release: boolean;
	is_public: boolean;
	is_of__class: 'fleet' | 'block' | 'app';
	is_archived: boolean;
	is_discoverable: boolean;
	is_stored_at__repository_url: string | null;
	public_organization: OptionalNavigationResource<PublicOrganization>;
	application_type: NavigationResource<ApplicationType>;
	is_for__device_type: NavigationResource<DeviceType>;
	depends_on__application: OptionalNavigationResource<Application>;
	organization: NavigationResource<Organization>;
	should_be_running__release: OptionalNavigationResource<Release>;

	application_config_variable?: ReverseNavigationResource<ApplicationVariable>;
	application_environment_variable?: ReverseNavigationResource<ApplicationVariable>;
	build_environment_variable?: ReverseNavigationResource<BuildVariable>;
	application_tag?: ReverseNavigationResource<ApplicationTag>;
	owns__device?: ReverseNavigationResource<Device>;
	owns__public_device?: ReverseNavigationResource<PublicDevice>;
	owns__release?: ReverseNavigationResource<Release>;
	service?: ReverseNavigationResource<Service>;
	is_depended_on_by__application?: ReverseNavigationResource<Application>;
	is_directly_accessible_by__user?: ReverseNavigationResource<User>;
	user_application_membership?: ReverseNavigationResource<ApplicationMembership>;
	team_application_access?: ReverseNavigationResource<TeamApplicationAccess>;
	can_use__application_as_host?: ReverseNavigationResource<ApplicationHostedOnApplication>;
}

export interface UserHasDirectAccessToApplication {
	user: NavigationResource<User>;
	has_direct_access_to__application: NavigationResource<Application>;
}

export interface PublicOrganization {
	name: string;
	handle: string;
}

export interface PublicDevice {
	latitude: string;
	longitude: string;
	belongs_to__application: NavigationResource<Application>;
	is_of__device_type: NavigationResource<DeviceType>;
	was_recently_online: boolean;
}

export interface Invitee {
	id: number;
	email: string;
}

export interface ApplicationInvite {
	id: number;
	message: string | null;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__application: NavigationResource<Application>;
}

export interface OrganizationInvite {
	id: number;
	message: string | null;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__organization: NavigationResource<Organization>;
}

export interface ApplicationType {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	/** @deprecated */
	supports_gateway_mode: boolean;
	supports_multicontainer: boolean;
	supports_web_url: boolean;
	is_legacy: boolean;
	requires_payment: boolean;
	needs__os_version_range: string | null;
	maximum_device_count: number | null;
}

export interface ApplicationHostedOnApplication {
	application: NavigationResource<Application>;
	can_use__application_as_host: NavigationResource<Application>;
}

export type ApplicationMembershipRoles = 'developer' | 'operator' | 'observer';

export interface ApplicationMembershipRole {
	id: number;
	name: ApplicationMembershipRoles;
}

export interface ApplicationMembership {
	id: number;
	user: NavigationResource<User>;
	/** application */
	is_member_of__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export interface TeamApplicationAccess {
	id: number;
	team: NavigationResource<Team>;
	/** application */
	grants_access_to__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export type ReleaseStatus =
	| 'cancelled'
	| 'error'
	| 'failed'
	| 'interrupted'
	| 'local'
	| 'running'
	| 'success'
	| 'timeout';

export interface ReleaseVersion {
	raw: string;
	major: number;
	minor: number;
	patch: number;
	version: string;
	build: readonly string[];
	prerelease: ReadonlyArray<string | number>;
}

export interface Release {
	id: number;
	created_at: string;
	commit: string;
	composition: JsonType | null;
	contract: JsonType | null;
	status: ReleaseStatus;
	source: string;
	build_log: string | null;
	is_invalidated: boolean;
	start_timestamp: string;
	update_timestamp: string;
	end_timestamp: string | null;
	phase: 'next' | 'current' | 'sunset' | 'end-of-life' | null;
	/** @deprecated */
	release_version: string | null;
	semver: string;
	semver_major: number;
	semver_minor: number;
	semver_patch: number;
	semver_prerelease: string;
	semver_build: string;
	variant: string;
	revision: number | null;
	known_issue_list: string | null;
	/** This is a computed term */
	raw_version: string;
	/** This is a computed term */
	version: ReleaseVersion;
	is_final: boolean;
	is_finalized_at__date: string | null;
	note: string | null;
	invalidation_reason: string | null;

	is_created_by__user: OptionalNavigationResource<User>;
	belongs_to__application: NavigationResource<Application>;

	/** @deprecated Prefer using the Term Form "release_image" property */
	contains__image?: ReverseNavigationResource<ReleaseImage>;
	release_image?: ReverseNavigationResource<ReleaseImage>;
	should_be_running_on__application?: ReverseNavigationResource<Application>;
	is_running_on__device?: ReverseNavigationResource<Device>;
	is_pinned_to__device?: ReverseNavigationResource<Device>;
	should_operate__device?: ReverseNavigationResource<Device>;
	should_manage__device?: ReverseNavigationResource<Device>;
	release_tag?: ReverseNavigationResource<ReleaseTag>;
}

export interface Device {
	id: number;
	actor: ConceptTypeNavigationResource<Actor>;
	created_at: string;
	modified_at: string;
	custom_latitude: string | null;
	custom_longitude: string | null;
	device_name: string;
	download_progress: number | null;
	ip_address: string | null;
	public_address: string | null;
	mac_address: string | null;
	is_accessible_by_support_until__date: string | null;
	is_connected_to_vpn: boolean;
	is_locked_until__date: string;
	update_status:
		| 'rejected'
		| 'downloading'
		| 'downloaded'
		| 'applying changes'
		| 'aborted'
		| 'done'
		| null;
	last_update_status_event: string | null;
	is_web_accessible: boolean;
	is_active: boolean;
	/** This is a computed term */
	is_frozen: boolean;
	is_online: boolean;
	last_connectivity_event: string | null;
	last_vpn_event: string;
	latitude: string | null;
	local_id: string | null;
	location: string | null;
	longitude: string | null;
	note: string;
	os_variant: string | null;
	os_version: string | null;
	provisioning_progress: number | null;
	provisioning_state: string;
	status: string;
	supervisor_version: string;
	uuid: string;
	api_heartbeat_state: 'online' | 'offline' | 'timeout' | 'unknown';
	memory_usage: number | null;
	memory_total: number | null;
	storage_block_device: string | null;
	storage_usage: number | null;
	storage_total: number | null;
	cpu_usage: number | null;
	cpu_temp: number | null;
	cpu_id: string | null;
	is_undervolted: boolean;
	/** This is a computed term */
	overall_status: DeviceOverallStatus;
	/** This is a computed term */
	overall_progress: number | null;

	is_of__device_type: NavigationResource<DeviceType>;
	// the schema has this as a nullable, but for simplicity we have it as non-optional
	belongs_to__application: NavigationResource<Application>;
	belongs_to__user: OptionalNavigationResource<User>;
	is_running__release: OptionalNavigationResource<Release>;
	is_pinned_on__release: OptionalNavigationResource<Release>;
	is_managed_by__service_instance: OptionalNavigationResource<ServiceInstance>;
	should_be_operated_by__release: OptionalNavigationResource<Release>;
	should_be_managed_by__release: OptionalNavigationResource<Release>;

	/** This is a computed term that works like: `device.is_pinned_on__release ?? device.belongs_to__application[0].should_be_running__release` */
	should_be_running__release: OptionalNavigationResource<Release>;

	device_config_variable?: ReverseNavigationResource<DeviceVariable>;
	device_environment_variable?: ReverseNavigationResource<DeviceVariable>;
	device_tag?: ReverseNavigationResource<DeviceTag>;
	service_install?: ReverseNavigationResource<ServiceInstall>;
	image_install?: ReverseNavigationResource<ImageInstall>;
}

export interface CpuArchitecture {
	id: number;
	slug: string;

	is_supported_by__device_type?: ReverseNavigationResource<CpuArchitecture>;
}

export interface DeviceType {
	id: number;
	slug: string;
	name: string;
	is_private: boolean;
	logo: string | null;
	contract: Contract | null;
	belongs_to__device_family: OptionalNavigationResource<DeviceFamily>;
	is_default_for__application?: ReverseNavigationResource<Application>;
	is_of__cpu_architecture: NavigationResource<CpuArchitecture>;
	is_accessible_privately_by__organization?: ReverseNavigationResource<Organization>;
	describes__device?: ReverseNavigationResource<Device>;
	device_type_alias?: ReverseNavigationResource<DeviceTypeAlias>;
}

export interface DeviceTypeAlias {
	id: number;
	is_referenced_by__alias: string;
	references__device_type: NavigationResource<DeviceType>;
}

export interface DeviceFamily {
	id: number;
	slug: string;
	name: string;
	is_manufactured_by__device_manufacturer: OptionalNavigationResource<DeviceManufacturer>;
}

export interface DeviceManufacturer {
	id: number;
	slug: string;
	name: string;
}

export interface OrganizationPrivateDeviceTypeAccess {
	id: number;
	organization: NavigationResource<Organization>;
	has_private_access_to__device_type: NavigationResource<DeviceType>;
}

export interface ServiceInstance {
	id: number;
	ip_address: string;
}

export interface Service {
	id: number;
	created_at: string;
	service_name: string;
	application: NavigationResource<Application>;
	is_built_by__image?: ReverseNavigationResource<Image>;
	service_environment_variable?: ReverseNavigationResource<ServiceEnvironmentVariable>;
	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface IdentityProvider {
	id: number;
	sso_identifier: string;
	entry_point: string;
	issuer: string;
	certificate: string;
	requires_signed_authn_response: boolean;
	manages__saml_account?: ReverseNavigationResource<SamlAccount>;
	identity_provider_membership?: ReverseNavigationResource<IdentityProviderMembership>;
}

export interface SamlAccount {
	id: number;
	belongs_to__user: NavigationResource<User>;
	was_generated_by__identity_provider: NavigationResource<IdentityProvider>;
	remote_id: string;
	display_name: string | null;
}

export interface IdentityProviderMembership {
	is_authorized_by__identity_provider: NavigationResource<IdentityProvider>;
	id: number;
	grants_access_to__team: OptionalNavigationResource<Team>;
	authorizes__organization: NavigationResource<Organization>;
}

export interface Image {
	id: number;
	created_at: string;
	build_log: string | null;
	contract: Contract | null;
	content_hash: string | null;
	project_type: string | null;
	status: string;
	is_stored_at__image_location: string;
	start_timestamp: string;
	end_timestamp: string | null;
	push_timestamp: string | null;
	image_size: string | null;
	dockerfile: string;
	error_message: string | null;
	is_a_build_of__service: NavigationResource<Service>;
	release_image?: ReverseNavigationResource<ReleaseImage>;
}

export interface ReleaseImage {
	id: number;
	created_at: string;
	image: NavigationResource<Image>;
	is_part_of__release: NavigationResource<Release>;
}

export interface SSHKey {
	title: string;
	public_key: string;
	id: number;
	created_at: string;

	user: NavigationResource<User>;
}

export interface SocialServiceAccount {
	belongs_to__user: NavigationResource<User>;
	display_name: string | null;
	provider: string;
}

export interface ImageInstall {
	id: number;
	download_progress: number | null;
	status: string;
	install_date: string;

	/** @deprecated Use `installs__image` instead. */
	image: NavigationResource<Image>;
	installs__image: NavigationResource<Image>;
	device: NavigationResource<Device>;
	is_provided_by__release: NavigationResource<Release>;
}

export interface ServiceInstall {
	id: number;
	device: NavigationResource<Device>;
	/** service */
	installs__service: NavigationResource<Service>;
	application: NavigationResource<Application>;

	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface EnvironmentVariableBase {
	id: number;
	name: string;
	value: string;
}

export interface DeviceServiceEnvironmentVariable
	extends EnvironmentVariableBase {
	service_install: NavigationResource<ServiceInstall>;
}

export interface ServiceEnvironmentVariable extends EnvironmentVariableBase {
	service: NavigationResource<Service>;
}

export interface DeviceVariable extends EnvironmentVariableBase {
	device: NavigationResource<Device>;
}

export interface ApplicationVariable extends EnvironmentVariableBase {
	application: NavigationResource<Application>;
}

export interface BuildVariable extends EnvironmentVariableBase {
	application: NavigationResource<Application>;
}

export interface ResourceTagBase {
	id: number;
	tag_key: string;
	value: string;
}

export interface ApplicationTag extends ResourceTagBase {
	application: NavigationResource<Application>;
}

export interface DeviceTag extends ResourceTagBase {
	device: NavigationResource<Device>;
}

export interface OrganizationMembershipTag extends ResourceTagBase {
	organization_membership: NavigationResource<OrganizationMembership>;
}

export interface ReleaseTag extends ResourceTagBase {
	release: NavigationResource<Release>;
}

export interface CreditBundle {
	id: number;
	created_at: string;
	is_created_by__user: OptionalNavigationResource<User>;
	original_quantity: number;
	total_balance: number;
	total_cost: number;
	payment_status:
		| 'processing'
		| 'paid'
		| 'failed'
		| 'complimentary'
		| 'cancelled'
		| 'refunded';
	belongs_to__organization: NavigationResource<Organization>;
	is_for__feature: NavigationResource<Feature>;
	is_associated_with__invoice_id: string | null;
	error_message: string | null;
}

// Billing model

export interface Feature {
	id: number;
	title: string;
	slug: string;
	billing_code: string | null;
	organization_credit_notification?: ReverseNavigationResource<OrganizationCreditNotification>;
}

export interface SupportFeature {
	id: number;
	feature: ConceptTypeNavigationResource<Feature>;
	support_tier: NavigationResource<SupportTier>;
}

export interface SupportTier {
	id: number;
	title: string;
	slug: string;
	includes_private_support: boolean;
	includes__SLA: string | null;
}

export interface Plan {
	id: number;
	title: string;
	billing_code: string | null;
	monthly_price: number;
	annual_price: number;
	can_self_serve: boolean;
	is_legacy: boolean;
	is_valid_from__date: string | null;
	is_valid_until__date: string | null;

	plan_feature?: ReverseNavigationResource<PlanFeature>;
	offers__plan_addon?: ReverseNavigationResource<PlanAddon>;
	plan__has__discount_code?: ReverseNavigationResource<PlanDiscountCode>;
}

export interface PlanAddon {
	id: number;
	base_price: number;
	can_self_serve: boolean;
	bills_dynamically: boolean;

	offers__feature: NavigationResource<Feature>;
}

export interface PlanDiscountCode {
	id: number;
	discount_code: string;
	plan: NavigationResource<Plan>;
}

export interface PlanFeature {
	id: number;
	quantity: number;
	provides__feature: NavigationResource<Feature>;
}

export type SubscriptionBillingCycle =
	| 'monthly'
	| 'quarterly'
	| 'biannual'
	| 'annual'
	| 'biennial'
	| 'triennial'
	| 'quadrennial'
	| 'quinquennial';

export interface Subscription {
	id: number;
	starts_on__date: string;
	ends_on__date: string | null;
	discount_percentage: number;
	billing_cycle: SubscriptionBillingCycle;
	origin: string;
	is_active: boolean;

	is_for__organization: NavigationResource<Organization>;
	is_for__plan: NavigationResource<Plan>;
	subscription_addon_discount?: ReverseNavigationResource<SubscriptionAddonDiscount>;
	subscription_prepaid_addon?: ReverseNavigationResource<SubscriptionPrepaidAddon>;
}

export interface SubscriptionPrepaidAddon {
	id: number;
	discount_percentage: number;
	quantity: number;
	starts_on__date: string;
	expires_on__date: string | null;

	is_for__plan_addon: NavigationResource<PlanAddon>;
	is_for__subscription: NavigationResource<Subscription>;
}

export interface SubscriptionAddonDiscount {
	id: number;
	discount_percentage: number;
	discounts__plan_addon: NavigationResource<PlanAddon>;
}

export interface DeviceHistory {
	created_at: string;
	id: number;
	end_timestamp: string | null;
	is_created_by__actor: OptionalNavigationResource<Actor>;
	is_ended_by__actor: OptionalNavigationResource<Actor>;
	tracks__device: NavigationResource<Device>;
	tracks__actor: OptionalNavigationResource<Actor>;
	uuid: string | null;
	belongs_to__application: NavigationResource<Application>;
	is_active: boolean;
	is_running__release: OptionalNavigationResource<Release>;
	should_be_running__release: OptionalNavigationResource<Release>;
	os_version: string | null;
	os_variant: string | null;
	supervisor_version: string | null;
	is_of__device_type: OptionalNavigationResource<DeviceType>;
	should_be_managed_by__release: OptionalNavigationResource<Release>;
}
