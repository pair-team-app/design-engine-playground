function randFloat(min, max) {
	min = (typeof min !== 'number') ? 0 : min;
	max = (typeof min !== 'number') ? 1 : max;

	return (Math.random() * (max - min) + min);
}

module.exports = randFloat;