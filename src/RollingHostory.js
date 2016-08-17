const contextHistory = [];

export function addHistory (item) {
	if (contextHistory[contextHistory.length - 1] !== item ) { // omit duplicate entries
		contextHistory.unshift(item);
		if (contextHistory.length > 11) {
			contextHistory.pop();
		}
	}
}


export function getHistory () {
	return contextHistory.slice(0);
}
