/*
	mobile.js
	--------------------------------------------------
	Mobile only Javascript (optimized)
*/


/*
	Hide iPhone URL bar after page load
	-----------------------------------
*/

window.onload = function() {
	if (!window.pageYOffset && !window.location.hash) {
		setTimeout(function() {
			window.scrollTo(0, 0);
		}, 100);
	}
}

addEventListener('load',function() {
	if (!window.pageYOffset && !window.location.hash) {
	    setTimeout(updateLayout, 0);
	}
}, false);

var currentWidth = 0;

function updateLayout() {
    if (window.innerWidth != currentWidth) {

        currentWidth = window.innerWidth;

        var orient = currentWidth == 320 ? 'profile' : 'landscape';
        document.body.setAttribute('orient', orient);
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 100);
   	}
}
setInterval(updateLayout, 400);