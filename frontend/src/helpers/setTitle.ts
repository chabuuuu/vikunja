export function setTitle(title : undefined | string) {
	document.title = (typeof title === 'undefined' || title === '')
		? 'EV PMIS'
		: `${title} | EV PMIS`
}
