import Gun from 'gun/gun';

const PEERS = ['https://nw-gun-relay.herokuapp.com/gun'];

Gun.chain.subscribe = function (publish) {
	let gun = this;
	const at = gun._;

	// check if the map() function has been called
	const isMap = !!(at.back || {}).each;

	if (isMap) {
		// creates a temporary store for all values passed by map()
		const cache = new Map();
		publish(Array.from(cache));

		gun = gun.on((data, key, event) => {
			const _key = Gun.node.soul(data) || event.via.soul || key;
			if (data === null) {
				// Remove this if clause if you want to return null values
				cache.delete(_key);
			} else {
				cache.set(_key, data);
			}

			publish(Array.from(cache));
		});
	} else {
		gun = gun.on(publish);
	}
	return gun.off;
};

export const gun = Gun({ peers: PEERS });
export const key = {};
