import type * as Model from './v7-model';

import type { DeviceOverallStatus } from './device-overall-status';
export type { DeviceOverallStatus } from './device-overall-status';
import type { Contract } from './contract';
import type {
	NavigationResource,
	OptionalNavigationResource,
	ReverseNavigationResource,
	ConceptTypeNavigationResource,
} from '../../typings/pinejs-client-core';
import type { AnyObject } from '../../typings/utils';

type KeysIncludingArray<T> = {
	[P in keyof T]-?: Extract<T[P], any[]> extends never ? P : never;
}[keyof T];
type OmitNav<T> = {
	[P in KeysIncludingArray<T>]: T[P];
};

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

export interface Organization extends OmitNav<Model.Organization['Read']> {
	is_using__billing_version: 'v1' | 'v2';

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
	extends OmitNav<Model.OrganizationCreditNotification['Read']> {
	organization: NavigationResource<Organization>;
	owns_credit_notification_for__feature: NavigationResource<Feature>;
}

export interface Team extends OmitNav<Model.Team['Read']> {
	belongs_to__organization: NavigationResource<Organization>;

	/** includes__user */
	team_membership?: ReverseNavigationResource<TeamMembership>;
	/** grants_access_to__application */
	team_application_access?: ReverseNavigationResource<TeamApplicationAccess>;
}

export interface RecoveryTwoFactor
	extends OmitNav<Model.RecoveryTwoFactor['Read']> {
	belongs_to__user: NavigationResource<User>;
}

export interface Actor extends OmitNav<Model.Actor['Read']> {
	is_of__user?: OptionalNavigationResource<User>;
	is_of__application?: OptionalNavigationResource<Application>;
	is_of__device?: OptionalNavigationResource<Device>;
	is_of__public_device?: OptionalNavigationResource<PublicDevice>;
	api_key?: OptionalNavigationResource<ApiKey>;
}

export interface User extends OmitNav<Model.User['Read']> {
	actor: ConceptTypeNavigationResource<Actor>;

	organization_membership?: ReverseNavigationResource<OrganizationMembership>;
	user_application_membership?: ReverseNavigationResource<ApplicationMembership>;
	team_membership?: ReverseNavigationResource<TeamMembership>;
	has_direct_access_to__application?: ReverseNavigationResource<Application>;
	user_profile?: ReverseNavigationResource<UserProfile>;
	owns__saml_account?: ReverseNavigationResource<SamlAccount>;
}

export interface UserProfile extends OmitNav<Model.UserProfile['Read']> {
	is_of__user: NavigationResource<User>;
}

export type OrganizationMembershipRoles = 'administrator' | 'member';

export interface OrganizationMembershipRole
	extends OmitNav<Model.OrganizationMembershipRole['Read']> {
	name: OrganizationMembershipRoles;
}

export interface OrganizationMembership
	extends OmitNav<Model.OrganizationMembership['Read']> {
	user: NavigationResource<User>;
	/** organization */
	is_member_of__organization: NavigationResource<Organization>;
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;

	organization_membership_tag?: ReverseNavigationResource<OrganizationMembershipTag>;
}

export interface TeamMembership extends OmitNav<Model.TeamMembership['Read']> {
	user: NavigationResource<User>;
	/** team */
	is_member_of__team: NavigationResource<Team>;
}

export interface ApiKey extends OmitNav<Model.ApiKey['Read']> {
	is_of__actor: NavigationResource<Actor>;
}

export interface Application extends OmitNav<Model.Application['Read']> {
	actor: ConceptTypeNavigationResource<Actor>;
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
	extends OmitNav<Model.UserHasDirectAccessToApplication['Read']> {
	user: NavigationResource<User>;
	has_direct_access_to__application: NavigationResource<Application>;
}

export type PublicOrganization = OmitNav<Model.PublicOrganization['Read']>;

export interface PublicDevice extends OmitNav<Model.PublicDevice['Read']> {
	belongs_to__application: NavigationResource<Application>;
	is_of__device_type: NavigationResource<DeviceType>;
}

export type Invitee = OmitNav<Model.Invitee['Read']>;

export interface ApplicationInvite
	extends OmitNav<Model.InviteeIsInvitedToApplication['Read']> {
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__application: NavigationResource<Application>;
}

export interface OrganizationInvite
	extends OmitNav<Model.InviteeIsInvitedToOrganization['Read']> {
	organization_membership_role: NavigationResource<OrganizationMembershipRole>;
	invitee: NavigationResource<Invitee>;
	is_invited_to__organization: NavigationResource<Organization>;
}

export type ApplicationType = OmitNav<Model.ApplicationType['Read']>;

export interface ApplicationHostedOnApplication
	extends OmitNav<Model.ApplicationCanUseApplicationAsHost['Read']> {
	application: NavigationResource<Application>;
	can_use__application_as_host: NavigationResource<Application>;
}

export type ApplicationMembershipRoles = 'developer' | 'operator' | 'observer';

export interface ApplicationMembershipRole
	extends OmitNav<Model.ApplicationMembershipRole['Read']> {
	name: ApplicationMembershipRoles;
}

export interface ApplicationMembership
	extends OmitNav<Model.UserIsMemberOfApplication['Read']> {
	user: NavigationResource<User>;
	/** application */
	is_member_of__application: NavigationResource<Application>;
	application_membership_role: NavigationResource<ApplicationMembershipRole>;
}

export interface TeamApplicationAccess
	extends OmitNav<Model.TeamApplicationAccess['Read']> {
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

export interface Release extends OmitNav<Model.Release['Read']> {
	composition: JsonType | null;
	contract: JsonType | null;
	status: ReleaseStatus;
	/** This is a computed term */
	version: ReleaseVersion;

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

export interface Device extends OmitNav<Model.Device['Read']> {
	actor: ConceptTypeNavigationResource<Actor>;
	/** This is a computed term */
	overall_status: DeviceOverallStatus;

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
	extends OmitNav<Model.CpuArchitecture['Read']> {
	is_supported_by__device_type?: ReverseNavigationResource<CpuArchitecture>;
}

export interface DeviceType extends OmitNav<Model.DeviceType['Read']> {
	contract: Contract | null;
	belongs_to__device_family: OptionalNavigationResource<DeviceFamily>;
	is_default_for__application?: ReverseNavigationResource<Application>;
	is_of__cpu_architecture: NavigationResource<CpuArchitecture>;
	is_accessible_privately_by__organization?: ReverseNavigationResource<Organization>;
	describes__device?: ReverseNavigationResource<Device>;
	device_type_alias?: ReverseNavigationResource<DeviceTypeAlias>;
}

export interface DeviceTypeAlias
	extends OmitNav<Model.DeviceTypeAlias['Read']> {
	references__device_type: NavigationResource<DeviceType>;
}

export interface DeviceFamily extends OmitNav<Model.DeviceFamily['Read']> {
	is_manufactured_by__device_manufacturer: OptionalNavigationResource<DeviceManufacturer>;
}

export type DeviceManufacturer = OmitNav<Model.DeviceManufacturer['Read']>;

export interface OrganizationPrivateDeviceTypeAccess
	extends OmitNav<Model.OrganizationHasPrivateAccessToDeviceType['Read']> {
	organization: NavigationResource<Organization>;
	has_private_access_to__device_type: NavigationResource<DeviceType>;
}

export type ServiceInstance = OmitNav<Model.ServiceInstance['Read']>;

export interface Service extends OmitNav<Model.Service['Read']> {
	application: NavigationResource<Application>;
	is_built_by__image?: ReverseNavigationResource<Image>;
	service_environment_variable?: ReverseNavigationResource<ServiceEnvironmentVariable>;
	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export interface IdentityProvider
	extends OmitNav<Model.IdentityProvider['Read']> {
	manages__saml_account?: ReverseNavigationResource<SamlAccount>;
	identity_provider_membership?: ReverseNavigationResource<IdentityProviderMembership>;
}

export interface SamlAccount extends OmitNav<Model.SamlAccount['Read']> {
	belongs_to__user: NavigationResource<User>;
	was_generated_by__identity_provider: NavigationResource<IdentityProvider>;
}

export interface IdentityProviderMembership
	extends OmitNav<Model.IdentityProviderMembership['Read']> {
	is_authorized_by__identity_provider: NavigationResource<IdentityProvider>;
	grants_access_to__team: OptionalNavigationResource<Team>;
	authorizes__organization: NavigationResource<Organization>;
}

export interface Image extends OmitNav<Model.Image['Read']> {
	contract: Contract | null;
	is_a_build_of__service: NavigationResource<Service>;
	release_image?: ReverseNavigationResource<ReleaseImage>;
}

export interface ReleaseImage
	extends OmitNav<Model.ImageIsPartOfRelease['Read']> {
	image: NavigationResource<Image>;
	is_part_of__release: NavigationResource<Release>;
}

export interface SSHKey extends OmitNav<Model.UserHasPublicKey['Read']> {
	user: NavigationResource<User>;
}

export interface SocialServiceAccount
	extends OmitNav<Model.SocialServiceAccount['Read']> {
	belongs_to__user: NavigationResource<User>;
}

export interface ImageInstall extends OmitNav<Model.ImageInstall['Read']> {
	/** @deprecated Use `installs__image` instead. */
	image: NavigationResource<Image>;
	installs__image: NavigationResource<Image>;
	device: NavigationResource<Device>;
	is_provided_by__release: NavigationResource<Release>;
}

export interface ServiceInstall extends OmitNav<Model.ServiceInstall['Read']> {
	device: NavigationResource<Device>;
	/** service */
	installs__service: NavigationResource<Service>;
	application: NavigationResource<Application>;

	device_service_environment_variable?: ReverseNavigationResource<DeviceServiceEnvironmentVariable>;
}

export type EnvironmentVariableBase = Pick<
	Model.DeviceServiceEnvironmentVariable['Read'] &
		Model.ServiceEnvironmentVariable['Read'] &
		Model.DeviceEnvironmentVariable['Read'] &
		Model.ApplicationEnvironmentVariable['Read'] &
		Model.BuildEnvironmentVariable['Read'],
	'id' | 'name' | 'value'
>;

export interface DeviceServiceEnvironmentVariable
	extends OmitNav<Model.DeviceServiceEnvironmentVariable['Read']> {
	service_install: NavigationResource<ServiceInstall>;
}

export interface ServiceEnvironmentVariable
	extends OmitNav<Model.ServiceEnvironmentVariable['Read']> {
	service: NavigationResource<Service>;
}

export interface DeviceVariable
	extends OmitNav<Model.DeviceEnvironmentVariable['Read']> {
	device: NavigationResource<Device>;
}

export interface ApplicationVariable
	extends OmitNav<Model.ApplicationEnvironmentVariable['Read']> {
	application: NavigationResource<Application>;
}

export interface BuildVariable
	extends OmitNav<Model.BuildEnvironmentVariable['Read']> {
	application: NavigationResource<Application>;
}

export type ResourceTagBase = Pick<
	Model.ApplicationTag['Read'] &
		Model.DeviceTag['Read'] &
		Model.OrganizationMembershipTag['Read'] &
		Model.ReleaseTag['Read'],
	'id' | 'tag_key' | 'value'
>;

export interface ApplicationTag extends OmitNav<Model.ApplicationTag['Read']> {
	application: NavigationResource<Application>;
}

export interface DeviceTag extends OmitNav<Model.DeviceTag['Read']> {
	device: NavigationResource<Device>;
}

export interface OrganizationMembershipTag
	extends OmitNav<Model.OrganizationMembershipTag['Read']> {
	organization_membership: NavigationResource<OrganizationMembership>;
}

export interface ReleaseTag extends OmitNav<Model.ReleaseTag['Read']> {
	release: NavigationResource<Release>;
}

export interface CreditBundle extends OmitNav<Model.CreditBundle['Read']> {
	is_created_by__user: OptionalNavigationResource<User>;
	belongs_to__organization: NavigationResource<Organization>;
	is_for__feature: NavigationResource<Feature>;
}

// Billing model

export interface Feature extends OmitNav<Model.Feature['Read']> {
	organization_credit_notification?: ReverseNavigationResource<OrganizationCreditNotification>;
}

export interface SupportFeature extends OmitNav<Model.SupportFeature['Read']> {
	feature: ConceptTypeNavigationResource<Feature>;
	support_tier: NavigationResource<SupportTier>;
}

export type SupportTier = OmitNav<Model.SupportTier['Read']>;

export interface Plan extends OmitNav<Model.Plan['Read']> {
	plan_feature?: ReverseNavigationResource<PlanFeature>;
	offers__plan_addon?: ReverseNavigationResource<PlanAddon>;
	plan__has__discount_code?: ReverseNavigationResource<PlanDiscountCode>;
}

export interface PlanAddon extends OmitNav<Model.PlanAddon['Read']> {
	offers__feature: NavigationResource<Feature>;
}

export interface PlanDiscountCode
	extends OmitNav<Model.PlanHasDiscountCode['Read']> {
	plan: NavigationResource<Plan>;
}

export interface PlanFeature extends OmitNav<Model.PlanFeature['Read']> {
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

export interface Subscription extends OmitNav<Model.Subscription['Read']> {
	billing_cycle: SubscriptionBillingCycle;

	is_for__organization: NavigationResource<Organization>;
	is_for__plan: NavigationResource<Plan>;
	subscription_addon_discount?: ReverseNavigationResource<SubscriptionAddonDiscount>;
	subscription_prepaid_addon?: ReverseNavigationResource<SubscriptionPrepaidAddon>;
}

export interface SubscriptionPrepaidAddon
	extends OmitNav<Model.SubscriptionPrepaidAddon['Read']> {
	is_for__plan_addon: NavigationResource<PlanAddon>;
	is_for__subscription: NavigationResource<Subscription>;
}

export interface SubscriptionAddonDiscount
	extends OmitNav<Model.SubscriptionDiscountsPlanAddon['Read']> {
	discounts__plan_addon: NavigationResource<PlanAddon>;
}

export interface DeviceHistory extends OmitNav<Model.DeviceHistory['Read']> {
	is_created_by__actor: OptionalNavigationResource<Actor>;
	is_ended_by__actor: OptionalNavigationResource<Actor>;
	tracks__device: NavigationResource<Device>;
	tracks__actor: OptionalNavigationResource<Actor>;
	belongs_to__application: NavigationResource<Application>;
	is_running__release: OptionalNavigationResource<Release>;
	should_be_running__release: OptionalNavigationResource<Release>;
	is_of__device_type: OptionalNavigationResource<DeviceType>;
	should_be_managed_by__release: OptionalNavigationResource<Release>;
}
