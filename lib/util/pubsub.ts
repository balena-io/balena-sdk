interface Subscription {
	eventName: string;
	fn: () => void;
}

export class PubSub {
	private subscriptions: Subscription[] = [];

	public subscribe = (eventName: string, fn: () => void) => {
		const subscriptionInfo = {
			eventName,
			fn,
		};
		this.subscriptions.push(subscriptionInfo);
		// an unsubscribe function
		return () => {
			const indexOfFn = this.subscriptions.indexOf(subscriptionInfo);
			return this.subscriptions.splice(indexOfFn, 1);
		};
	};

	public publish = (eventName: string) => {
		this.subscriptions.forEach((subscription) => {
			if (eventName === subscription.eventName) {
				subscription.fn();
			}
		});
	};
}
