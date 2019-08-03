
function randFloat(min, max) {
	min = (typeof min !== 'number') ? 0 : min;
	max = (typeof min !== 'number') ? 1 : max;

	return (Math.random() * (max - min) + min);
}

function randInt(min, max) {
	return (randFloat(min, max) << 0);
}

module.exports = {
	randFloat,
	randInt
};