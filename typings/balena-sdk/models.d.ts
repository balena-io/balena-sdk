import {
	PineDeferred,
	OptionalNavigationResource,
	ReverseNavigationResource,
	NavigationResource,
} from '../pinejs-client-core';
import * as DeviceOverallStatus from './device-overall-status';

// tslint:disable-next-line:no-module
declare module './index' {
	export interface Organization {
		id: number;
		created_at: string;
		name: string;
		handle: string;

		application: ReverseNavigationResource<Application>;
		/** includes__organization_membership */
		organization_membership: ReverseNavigationResource<OrganizationMembership>;
		owns__team: ReverseNavigationResource<Team>;
	}

	export interface Team {
		id: number;
		created_at: string;
		name: string;

		belongs_to__organization: NavigationResource<Organization>;

		/** includes__user */
		team_membership: ReverseNavigationResource<TeamMembership>;
		/** grants_access_to__application */
		team_application_access: ReverseNavigationResource<TeamApplicationAccess>;
	}

	export interface SocialServiceAccount {
		provider: string;
		display_name: string;
	}

	export interface User {
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

		/** includes__organization_membership */
		organization_membership: ReverseNavigationResource<OrganizationMembership>;
		/** user_application_membership */
		user__is_member_of__application: ReverseNavigationResource<
			ApplicationMembership
		>;
		/** is_member_of__team */
		team_membership: ReverseNavigationResource<TeamMembership>;
		creates__release: ReverseNavigationResource<Release>;
		owns__device: ReverseNavigationResource<Device>;
		// this is what the api route returns
		social_service_account: ReverseNavigationResource<SocialServiceAccount>;
	}

	export type OrganizationMembershipRoles = 'administrator' | 'member';

	export interface OrganizationMembershipRole {
		id: number;
		name: OrganizationMembershipRoles;
	}

	/** organization_membership */
	export interface OrganizationMembership {
		id: number;
		created_at: string;

		user: NavigationResource<User>;
		/** organization */
		is_member_of__organization: NavigationResource<Organization>;
		organization_membership_role: NavigationResource<
			OrganizationMembershipRole
		>;
	}

	/** team_membership */
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

		is_of__actor: PineDeferred;
	}

	export interface Application {
		id: number;
		created_at: string;
		app_name: string;
		slug: string;
		is_accessible_by_support_until__date: string;
		is_host: boolean;
		should_track_latest_release: boolean;
		is_public: boolean;
		is_archived: boolean;

		application_type: NavigationResource<ApplicationType>;
		is_for__device_type: NavigationResource<DeviceType>;
		depends_on__application: OptionalNavigationResource<Application>;
		organization: NavigationResource<Organization>;
		should_be_running__release: OptionalNavigationResource<Release>;

		application_config_variable: ReverseNavigationResource<ApplicationVariable>;
		application_environment_variable: ReverseNavigationResource<
			ApplicationVariable
		>;
		application_tag: ReverseNavigationResource<ApplicationTag>;
		owns__device: ReverseNavigationResource<Device>;
		owns__release: ReverseNavigationResource<Release>;
		is_depended_on_by__application: ReverseNavigationResource<Application>;
		/** includes__user */
		user__is_member_of__application: ReverseNavigationResource<
			ApplicationMembership
		>;
		/** is_accessible_by__team */
		team_application_access: ReverseNavigationResource<TeamApplicationAccess>;
	}

	export interface Invitee {
		id: number;
		created_at: string;
		email: string;
	}

	export interface ApplicationInvite {
		id: number;
		message?: string;
		created_at: string;
		invitationToken: string;
		application_membership_role: NavigationResource<ApplicationMembershipRole>;
		invitee: NavigationResource<Invitee>;
		is_invited_to__application: NavigationResource<Application>;
	}

	export interface ApplicationType {
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
		is_host_os: boolean;
	}

	export type ApplicationMembershipRoles =
		| 'developer'
		| 'operator'
		| 'observer';

	export interface ApplicationMembershipRole {
		id: number;
		name: ApplicationMembershipRoles;
	}

	/** user__is_member_of__application */
	export interface ApplicationMembership {
		id: number;
		user: NavigationResource<User>;
		/** application */
		is_member_of__application: NavigationResource<Application>;
		application_membership_role: NavigationResource<ApplicationMembershipRole>;
	}

	/** team_application_access */
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
		| 'timeout'
		| null;

	export interface Release {
		id: number;
		created_at: string;
		commit: string;
		composition: string | null;
		status: ReleaseStatus;
		source: string;
		build_log: string | null;
		is_invalidated: boolean;
		start_timestamp: string;
		update_timestamp: string | null;
		end_timestamp: string;

		is_created_by__user: OptionalNavigationResource<User>;
		belongs_to__application: NavigationResource<Application>;

		contains__image: ReverseNavigationResource<{
			id: number;
			image: NavigationResource<Image>;
		}>;
		should_be_running_on__application: ReverseNavigationResource<Application>;
		is_running_on__device: ReverseNavigationResource<Device>;
		should_be_running_on__device: ReverseNavigationResource<Device>;
		release_tag: ReverseNavigationResource<ReleaseTag>;
	}

	export interface Device {
		id: number;
		created_at: string;
		custom_latitude?: string;
		custom_longitude?: string;
		device_name: string;
		download_progress?: number;
		ip_address: string | null;
		mac_address: string | null;
		is_accessible_by_support_until__date: string;
		is_connected_to_vpn: boolean;
		is_in_local_mode?: boolean;
		is_locked_until__date: string;
		is_web_accessible: boolean;
		is_active: boolean;
		is_online: boolean;
		last_connectivity_event: string;
		last_vpn_event: string;
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
		api_heartbeat_state: 'online' | 'offline' | 'timeout' | 'unknown';
		/** This is a computed term */
		overall_status: DeviceOverallStatus.DeviceOverallStatus;
		/** This is a computed term */
		overall_progress: number | null;

		is_of__device_type: NavigationResource<DeviceType>;
		// the schema has this as a nullable, but for simplicity we have it as non-optional
		belongs_to__application: NavigationResource<Application>;
		belongs_to__user: OptionalNavigationResource<User>;
		is_running__release: OptionalNavigationResource<Release>;
		should_be_running__release: OptionalNavigationResource<Release>;
		is_managed_by__service_instance: OptionalNavigationResource<
			ServiceInstance
		>;
		is_managed_by__device: OptionalNavigationResource<Device>;
		should_be_managed_by__supervisor_release: OptionalNavigationResource<
			SupervisorRelease
		>;

		device_config_variable: ReverseNavigationResource<DeviceVariable>;
		device_environment_variable: ReverseNavigationResource<DeviceVariable>;
		device_tag: ReverseNavigationResource<DeviceTag>;
		manages__device: ReverseNavigationResource<Device>;
		service_install: ReverseNavigationResource<ServiceInstall>;
	}

	/** device_type */
	export interface DeviceType {
		id: number;
		slug: string;
		name: string;
		is_private: string;

		is_accessible_privately_by__organization: ReverseNavigationResource<
			Organization
		>;
		describes_device: ReverseNavigationResource<Device>;
	}

	export type DeviceOverallStatus = DeviceOverallStatus.DeviceOverallStatus;

	/** organization__has_private_access_to__device_type */
	export interface OrganizationPrivateDeviceTypeAccess {
		id: number;
		organization: NavigationResource<Organization>;
		has_private_access_to__device_type: NavigationResource<DeviceType>;
	}

	export interface DeviceWithImageInstalls extends Device {
		image_install: ReverseNavigationResource<ImageInstall>;
		gateway_download: ReverseNavigationResource<GatewayDownload>;
	}

	export interface SupervisorRelease {
		created_at: string;
		id: number;
		supervisor_version: string;
		image_name: string;
		is_public: boolean;
		note?: string;

		is_for__device_type: NavigationResource<DeviceType>;
	}

	export interface ServiceInstance {
		id: number;
		created_at: string;
		service_type: string;
		ip_address: string;
		last_heartbeat: string;
	}

	export interface Service {
		id: number;
		created_at: string;
		service_name: string;
		application: NavigationResource<Application>;
	}

	export interface Image {
		id: number;
		created_at: string;
		build_log: string;
		contract: string | null;
		content_hash?: string | null;
		project_type?: string | null;
		status: string;
		is_stored_at__image_location: string;
		start_timestamp?: string | null;
		end_timestamp?: string | null;
		push_timestamp?: string | null;
		image_size?: number | null;
		dockerfile: string;
		error_message?: string | null;
		is_a_build_of__service: NavigationResource<Service>;
	}

	export interface SSHKey {
		title: string;
		public_key: string;
		id: number;
		created_at: string;

		user: NavigationResource<User>;
	}

	export interface ImageInstall {
		id: number;
		download_progress: number;
		status: string;
		install_date: string;

		image: NavigationResource<Image>;
		is_provided_by__release: NavigationResource<Release>;
	}

	export interface GatewayDownload {
		id: number;
		download_progress: number;
		status: string;

		image: NavigationResource<Image>;
	}

	export interface ServiceInstall {
		id: number;
		should_be_running: boolean;
		device: NavigationResource<Device>;
		/** service */
		installs__service: NavigationResource<Service>;
		application: NavigationResource<Application>;

		device_service_environment_variable: ReverseNavigationResource<
			DeviceServiceEnvironmentVariable
		>;
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

	export interface ReleaseTag extends ResourceTagBase {
		release: NavigationResource<Release>;
	}
}
