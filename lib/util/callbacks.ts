import * as Bluebird from 'bluebird';
import { Dictionary } from '../../typings/utils';

// Use with: `findCallback(arguments)`.
const findCallback = (args: IArguments): ((...args: any[]) => any) | void => {
	const lastArg = args[args.length - 1];
	if (typeof lastArg === 'function') {
		return lastArg;
	}

	return;
};

const isThenable = (a: any): a is PromiseLike<any> => {
	return typeof a === 'object' && typeof a.then === 'function';
};

const addCallbackSupport = <T extends (...args: any[]) => any>(fn: T): T => {
	return function () {
		const callback = findCallback(arguments);
		const result = fn.apply(this, arguments);
		if (!callback || !isThenable(result)) {
			return result;
		}

		const bluebirdPromise =
			result instanceof Bluebird
				? (result as Bluebird<any>)
				: Bluebird.resolve(result);

		return bluebirdPromise.asCallback(callback);
	} as T;
};

export const addCallbackSupportToModule = <T extends Dictionary<any>>(
	sdkModule: T,
): T => {
	const result = {} as T;
	for (const key of Object.keys(sdkModule) as Array<keyof typeof sdkModule>) {
		// const propertyDescriptor = Object.getOwnPropertyDescriptor(sdkModule, key);

		// // do not extend getters, since it would break lazy loading
		// if (propertyDescriptor?.get != null) {
		// 	Object.defineProperty(result, key, propertyDescriptor);
		// 	continue;
		// }

		const isPublicProp = typeof key === 'string' && !key.startsWith('_');
		const moduleProp = sdkModule[key];

		// if (isPublicProp &&
		// 	typeof moduleProp === 'object') {
		// 	throw new Error('addCallbackSupportToModule was called on a module with a non-lazy loaded sub-namespace');
		// }

		const shouldAddCallback = isPublicProp && typeof moduleProp === 'function';

		result[key] = shouldAddCallback
			? addCallbackSupport(moduleProp)
			: moduleProp;
	}

	return result;
};

export const addCallbackSupportToModuleFactory = <
	T extends (...args: any[]) => any
>(
	moduleFactory: T,
): T => {
	return function () {
		return addCallbackSupportToModule(moduleFactory.apply(this, arguments));
	} as T;
};
