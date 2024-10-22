import type * as Model from './v7-model';

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

export interface Organization
	extends Pick<
		Model.Organization['Read'],
		| 'id'
		| 'created_at'
		| 'name'
		| 'handle'
		| 'has_past_due_invoice_since__date'
		| 'is_frozen'
		| 'is_using__billing_version'
		| 'logo_image'
	> {
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

export interface OrganizationCreditNotification
	extends Pick<
		Model.OrganizationCreditNotification['Read'],
		'id' | 'created_at' | 'is_sent_when_below__threshold'
	> {
	id: number;
	created_at: string;
	is_sent_when_below__threshold: number;
	organization: NavigationResource<Organization>;
	owns_credit_notification_for__feature: NavigationResource<Feature>;
}

export interface Team
	extends Pick<Model.Team['Read'], 'id' | 'created_at' | 'name'> {
	id: number;
	created_at: string;
	name: string;

	belongs_to__organization: NavigationResource<Organization>;

	/** includes__user */
	team_membership?: ReverseNavigationResource<TeamMembership>;
	/** grants_access_to__application */
	team_application_access?: ReverseNavigationResource<TeamApplicationAccess>;
}

export interface RecoveryTwoFactor
	extends Pick<Model.RecoveryTwoFactor['Read'], 'id' | 'used_timestamp'> {
	id: number;
	used_timestamp: string | null;

	belongs_to__user: NavigationResource<User>;
}

export interface Actor extends Pick<Model.Actor['Read'], 'id'> {
	id: number;

	is_of__user?: OptionalNavigationResource<User>;
	is_of__application?: OptionalNavigationResource<Application>;
	is_of__device?: OptionalNavigationResource<Device>;
	is_of__public_device?: OptionalNavigationResource<PublicDevice>;
	api_key?: OptionalNavigationResource<ApiKey>;
}

export interface User
	extends Pick<Model.User['Read'], 'id' | 'created_at' | 'username'> {
	id: number;
	actor: ConceptTypeNavigationResource<Actor>;
	created_at: string;
	username: string;

	organization_membership?: ReverseNavigationResource<OrganizationMembership>;
	user_application_membership?: ReverseNavigationResource<ApplicationMembership>;
	team_membership?: ReverseNavigationResource<TeamMembership>;
	has_direct_access_to__application?: ReverseNavigationResource<Application>;
	user_profile?: ReverseNavigationResource<UserProfile>;
	owns__saml_account?: ReverseNavigationResource<SamlAccount>;
}

export interface UserProfile
	extends Pick<
		Model.UserProfile['Read'],
		| 'id'
		| 'email'
		| 'first_name'
		| 'last_name'
		| 'company'
		| 'account_type'
		| 'has_disabled_newsletter'
		| 'has_password_set'
		| 'must_be_verified'
		| 'is_verified'
	> {
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

export interface OrganizationMembershipRole
	extends Pick<Model.OrganizationMembershipRole['Read'], 'id' | 'name'> {
	id: number;
	name: OrganizationMembershipRoles;
}

export interface OrganizationMembership
	extends Pick<
		Model.OrganizationMembership['Read'],
		'id' | 'created_at' | 'effective_seat_role'
	> {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** organization */
	is_member_of__organization: NavigationResource<Organization>;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	effective_seat_role: string;

	organization_membership_tag?: ReverseNavigationResource<OrganizationMembershipTag>;
}

export interface TeamMembership
	extends Pick<Model.TeamMembership['Read'], 'id' | 'created_at'> {
	id: number;
	created_at: string;

	user: NavigationResource<User>;
	/** team */
	is_member_of__team: NavigationResource<Team>;
}

export interface ApiKey
	extends Pick<
		Model.ApiKey['Read'],
		'id' | 'created_at' | 'name' | 'description' | 'expiry_date'
	> {
	id: number;
	created_at: string;
	name: string;
	description: string | null;
	expiry_date: string | null;

	is_of__actor: NavigationResource<Actor>;
}

export interface Application
	extends Pick<
		Model.Application['Read'],
		| 'id'
		| 'created_at'
		| 'app_name'
		| 'slug'
		| 'uuid'
		| 'is_accessible_by_support_until__date'
		| 'is_host'
		| 'should_track_latest_release'
		| 'is_public'
		| 'is_of__class'
		| 'is_archived'
		| 'is_discoverable'
		| 'is_stored_at__repository_url'
	> {
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

export interface UserHasDirectAccessToApplication
	extends Pick<Model.UserHasDirectAccessToApplication['Read'], never> {
	user: NavigationResource<User>;
	has_direct_access_to__application: NavigationResource<Application>;
}

export interface PublicOrganization
	extends Pick<Model.PublicOrganization['Read'], 'name' | 'handle'> {
	name: string;
	handle: string;
}

export interface PublicDevice
	extends Pick<
		Model.PublicDevice['Read'],
		'latitude' | 'longitude' | 'was_recently_online'
	> {
	latitude: string;
	longitude: string;
	belongs_to__application: NavigationResource<Application>;
	is_of__device_type: NavigationResource<DeviceType>;
	was_recently_online: boolean;
}

export interface Invitee extends Pick<Model.Invitee['Read'], 'id' | 'email'> {
	id: number;
	email: string;
}

export interface ApplicationInvite
	extends Pick<
		Model.InviteeIsInvitedToApplication['Read'],
		'id' | 'message' | 'invitee'
	> {
	id: number;
	message: string | null;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__application: NavigationResource<Application>;
}

export interface OrganizationInvite
	extends Pick<Model.InviteeIsInvitedToOrganization['Read'], 'id' | 'message'> {
	id: number;
	message: string | null;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__organization: NavigationResource<Organization>;
}

export interface ApplicationType
	extends Pick<
		Model.ApplicationType['Read'],
		| 'id'
		| 'name'
		| 'slug'
		| 'description'
		| 'supports_gateway_mode'
		| 'supports_multicontainer'
		| 'supports_web_url'
		| 'is_legacy'
		| 'requires_payment'
		| 'needs__os_version_range'
		| 'maximum_device_count'
	> {
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

export interface ApplicationHostedOnApplication
	extends Pick<Model.ApplicationCanUseApplicationAsHost['Read'], never> {
	application: NavigationResource<Application>;
	can_use__application_as_host: NavigationResource<Application>;
}

export type ApplicationMembershipRoles = 'developer' | 'operator' | 'observer';

export interface ApplicationMembershipRole
	extends Pick<Model.ApplicationMembershipRole['Read'], 'id' | 'name'> {
	id: number;
	name: ApplicationMembershipRoles;
}

export interface ApplicationMembership
	extends Pick<Model.UserIsMemberOfApplication['Read'], 'id'> {
	id: number;
	user: NavigationResource<User>;
	/** application */
	is_member_of__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export interface TeamApplicationAccess
	extends Pick<Model.TeamApplicationAccess['Read'], 'id'> {
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

export interface Release
	extends Pick<
		Model.Release['Read'],
		| 'id'
		| 'created_at'
		| 'commit'
		// | 'composition'
		| 'contract'
		| 'status'
		| 'source'
		| 'build_log'
		| 'is_invalidated'
		| 'start_timestamp'
		| 'update_timestamp'
		| 'end_timestamp'
		| 'phase'
		| 'release_version'
		| 'semver'
		| 'semver_major'
		| 'semver_minor'
		| 'semver_patch'
		| 'semver_prerelease'
		| 'semver_build'
		| 'variant'
		| 'revision'
		| 'known_issue_list'
		| 'raw_version'
		// | 'version'
		| 'is_final'
		| 'is_finalized_at__date'
		| 'note'
		| 'invalidation_reason'
	> {
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

export interface Device
	extends Pick<
		Model.Device['Read'],
		| 'id'
		| 'created_at'
		| 'modified_at'
		| 'custom_latitude'
		| 'custom_longitude'
		| 'device_name'
		| 'download_progress'
		| 'ip_address'
		| 'public_address'
		| 'mac_address'
		| 'is_accessible_by_support_until__date'
		| 'is_connected_to_vpn'
		| 'is_locked_until__date'
		| 'update_status'
		| 'last_update_status_event'
		| 'is_web_accessible'
		| 'is_active'
		| 'is_frozen'
		| 'is_online'
		| 'last_connectivity_event'
		| 'last_vpn_event'
		| 'latitude'
		| 'local_id'
		| 'location'
		| 'longitude'
		| 'note'
		| 'os_variant'
		| 'os_version'
		| 'provisioning_progress'
		| 'provisioning_state'
		| 'status'
		| 'supervisor_version'
		| 'uuid'
		| 'api_heartbeat_state'
		| 'memory_usage'
		| 'memory_total'
		| 'storage_block_device'
		| 'storage_usage'
		| 'storage_total'
		| 'cpu_usage'
		| 'cpu_temp'
		| 'cpu_id'
		| 'is_undervolted'
		| 'overall_status'
		| 'overall_progress'
	> {
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

export interface CpuArchitecture
	extends Pick<Model.CpuArchitecture['Read'], 'id' | 'slug'> {
	id: number;
	slug: string;

	is_supported_by__device_type?: ReverseNavigationResource<CpuArchitecture>;
}

export interface DeviceType
	extends Pick<
		Model.DeviceType['Read'],
		'id' | 'slug' | 'name' | 'is_private' | 'logo' // | 'contract'
	> {
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

export interface DeviceTypeAlias
	extends Pick<
		Model.DeviceTypeAlias['Read'],
		'id' | 'is_referenced_by__alias'
	> {
	id: number;
	is_referenced_by__alias: string;
	references__device_type: NavigationResource<DeviceType>;
}

export interface DeviceFamily
	extends Pick<Model.DeviceFamily['Read'], 'id' | 'slug' | 'name'> {
	id: number;
	slug: string;
	name: string;
	is_manufactured_by__device_manufacturer: OptionalNavigationResource<DeviceManufacturer>;
}

export interface DeviceManufacturer
	extends Pick<Model.DeviceManufacturer['Read'], 'id' | 'slug' | 'name'> {
	id: number;
	slug: string;
	name: string;
}

export interface OrganizationPrivateDeviceTypeAccess
	extends Pick<Model.OrganizationHasPrivateAccessToDeviceType['Read'], 'id'> {
	id: number;
	organization: NavigationResource<Organization>;
	has_private_access_to__device_type: NavigationResource<DeviceType>;
}

export interface ServiceInstance
	extends Pick<Model.ServiceInstance['Read'], 'id' | 'ip_address'> {
	id: number;
	ip_address: string;
}

export interface Service
	extends Pick<Model.Service['Read'], 'id' | 'created_at' | 'service_name'> {
	id: number;
	created_at: string;
	service_name: string;
	application: NavigationResource<Application>;
	is_built_by__image?: ReverseNavigationResource<Image>;
	service_environment_variable?: ReverseNavigationResource<ServiceEnvironmentVariable>;
	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface IdentityProvider
	extends Pick<
		Model.IdentityProvider['Read'],
		| 'id'
		| 'sso_identifier'
		| 'entry_point'
		| 'issuer'
		| 'certificate'
		| 'requires_signed_authn_response'
	> {
	id: number;
	sso_identifier: string;
	entry_point: string;
	issuer: string;
	certificate: string;
	requires_signed_authn_response: boolean;
	manages__saml_account?: ReverseNavigationResource<SamlAccount>;
	identity_provider_membership?: ReverseNavigationResource<IdentityProviderMembership>;
}

export interface SamlAccount
	extends Pick<Model.SamlAccount['Read'], 'id' | 'remote_id' | 'display_name'> {
	id: number;
	belongs_to__user: NavigationResource<User>;
	was_generated_by__identity_provider: NavigationResource<IdentityProvider>;
	remote_id: string;
	display_name: string | null;
}

export interface IdentityProviderMembership
	extends Pick<Model.IdentityProviderMembership['Read'], 'id'> {
	is_authorized_by__identity_provider: NavigationResource<IdentityProvider>;
	id: number;
	grants_access_to__team: OptionalNavigationResource<Team>;
	authorizes__organization: NavigationResource<Organization>;
}

export interface Image
	extends Pick<
		Model.Image['Read'],
		| 'id'
		| 'created_at'
		| 'build_log'
		// | 'contract'
		| 'content_hash'
		| 'project_type'
		| 'status'
		| 'is_stored_at__image_location'
		| 'start_timestamp'
		| 'end_timestamp'
		| 'push_timestamp'
		| 'image_size'
		| 'dockerfile'
		| 'error_message'
	> {
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

export interface ReleaseImage
	extends Pick<Model.ImageIsPartOfRelease['Read'], 'id' | 'created_at'> {
	id: number;
	created_at: string;
	image: NavigationResource<Image>;
	is_part_of__release: NavigationResource<Release>;
}

export interface SSHKey
	extends Pick<
		Model.UserHasPublicKey['Read'],
		'title' | 'public_key' | 'id' | 'created_at'
	> {
	title: string;
	public_key: string;
	id: number;
	created_at: string;

	user: NavigationResource<User>;
}

export interface SocialServiceAccount
	extends Pick<
		Model.SocialServiceAccount['Read'],
		'display_name' | 'provider'
	> {
	belongs_to__user: NavigationResource<User>;
	display_name: string | null;
	provider: string;
}

export interface ImageInstall
	extends Pick<
		Model.ImageInstall['Read'],
		'id' | 'download_progress' | 'status' | 'install_date'
	> {
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

export interface ServiceInstall
	extends Pick<Model.ServiceInstall['Read'], 'id'> {
	id: number;
	device: NavigationResource<Device>;
	/** service */
	installs__service: NavigationResource<Service>;
	application: NavigationResource<Application>;

	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface EnvironmentVariableBase
	extends Pick<
		Model.DeviceServiceEnvironmentVariable['Read'] &
			Model.ServiceEnvironmentVariable['Read'] &
			Model.DeviceEnvironmentVariable['Read'] &
			Model.ApplicationEnvironmentVariable['Read'] &
			Model.BuildEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	id: number;
	name: string;
	value: string;
}

export interface DeviceServiceEnvironmentVariable
	extends Pick<
		Model.DeviceServiceEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	service_install: NavigationResource<ServiceInstall>;
}

export interface ServiceEnvironmentVariable
	extends Pick<
		Model.ServiceEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	service: NavigationResource<Service>;
}

export interface DeviceVariable
	extends Pick<
		Model.DeviceEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	device: NavigationResource<Device>;
}

export interface ApplicationVariable
	extends Pick<
		Model.ApplicationEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	application: NavigationResource<Application>;
}

export interface BuildVariable
	extends Pick<
		Model.BuildEnvironmentVariable['Read'],
		'id' | 'name' | 'value'
	> {
	application: NavigationResource<Application>;
}

export interface ResourceTagBase
	extends Pick<
		Model.ApplicationTag['Read'] &
			Model.DeviceTag['Read'] &
			Model.OrganizationMembershipTag['Read'] &
			Model.ReleaseTag['Read'],
		'id' | 'tag_key' | 'value'
	> {
	id: number;
	tag_key: string;
	value: string;
}

export interface ApplicationTag
	extends Pick<Model.ApplicationTag['Read'], 'id' | 'tag_key' | 'value'> {
	application: NavigationResource<Application>;
}

export interface DeviceTag
	extends Pick<Model.DeviceTag['Read'], 'id' | 'tag_key' | 'value'> {
	device: NavigationResource<Device>;
}

export interface OrganizationMembershipTag
	extends Pick<
		Model.OrganizationMembershipTag['Read'],
		'id' | 'tag_key' | 'value'
	> {
	organization_membership: NavigationResource<OrganizationMembership>;
}

export interface ReleaseTag
	extends Pick<Model.ReleaseTag['Read'], 'id' | 'tag_key' | 'value'> {
	release: NavigationResource<Release>;
}

export interface CreditBundle
	extends Pick<
		Model.CreditBundle['Read'],
		| 'id'
		| 'created_at'
		| 'original_quantity'
		| 'total_balance'
		| 'total_cost'
		| 'payment_status'
		| 'is_associated_with__invoice_id'
		| 'error_message'
	> {
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

export interface Feature
	extends Pick<
		Model.Feature['Read'],
		'id' | 'title' | 'slug' | 'billing_code'
	> {
	id: number;
	title: string;
	slug: string;
	billing_code: string | null;
	organization_credit_notification?: ReverseNavigationResource<OrganizationCreditNotification>;
}

export interface SupportFeature
	extends Pick<Model.SupportFeature['Read'], 'id'> {
	id: number;
	feature: ConceptTypeNavigationResource<Feature>;
	support_tier: NavigationResource<SupportTier>;
}

export interface SupportTier
	extends Pick<
		Model.SupportTier['Read'],
		'id' | 'title' | 'slug' | 'includes_private_support' | 'includes__SLA'
	> {
	id: number;
	title: string;
	slug: string;
	includes_private_support: boolean;
	includes__SLA: string | null;
}

export interface Plan
	extends Pick<
		Model.Plan['Read'],
		| 'id'
		| 'title'
		| 'billing_code'
		| 'monthly_price'
		| 'annual_price'
		| 'can_self_serve'
		| 'is_legacy'
		| 'is_valid_from__date'
		| 'is_valid_until__date'
	> {
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

export interface PlanAddon
	extends Pick<
		Model.PlanAddon['Read'],
		'id' | 'base_price' | 'can_self_serve' | 'bills_dynamically'
	> {
	id: number;
	base_price: number;
	can_self_serve: boolean;
	bills_dynamically: boolean;

	offers__feature: NavigationResource<Feature>;
}

export interface PlanDiscountCode
	extends Pick<Model.PlanHasDiscountCode['Read'], 'id' | 'discount_code'> {
	id: number;
	discount_code: string;
	plan: NavigationResource<Plan>;
}

export interface PlanFeature
	extends Pick<Model.PlanFeature['Read'], 'id' | 'quantity'> {
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

export interface Subscription
	extends Pick<
		Model.Subscription['Read'],
		| 'id'
		| 'starts_on__date'
		| 'ends_on__date'
		| 'discount_percentage'
		| 'billing_cycle'
		| 'origin'
		| 'is_active'
	> {
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

export interface SubscriptionPrepaidAddon
	extends Pick<
		Model.SubscriptionPrepaidAddon['Read'],
		| 'id'
		| 'discount_percentage'
		| 'quantity'
		| 'starts_on__date'
		| 'expires_on__date'
	> {
	id: number;
	discount_percentage: number;
	quantity: number;
	starts_on__date: string;
	expires_on__date: string | null;

	is_for__plan_addon: NavigationResource<PlanAddon>;
	is_for__subscription: NavigationResource<Subscription>;
}

export interface SubscriptionAddonDiscount
	extends Pick<
		Model.SubscriptionDiscountsPlanAddon['Read'],
		'id' | 'discount_percentage'
	> {
	id: number;
	discount_percentage: number;
	discounts__plan_addon: NavigationResource<PlanAddon>;
}

export interface DeviceHistory
	extends Pick<
		Model.DeviceHistory['Read'],
		| 'created_at'
		| 'id'
		| 'end_timestamp'
		| 'uuid'
		| 'is_active'
		| 'os_version'
		| 'os_variant'
		| 'supervisor_version'
	> {
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
