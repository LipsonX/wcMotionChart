
/* load image*/
var avatarImg = new Image();
avatarImg.src = "image/avatar.jpg";

/* init chart */
var today = new Date();
$('#wcMotion').wcChart({
	fill: {gradient: [["#21B881",.1], ["#0E8FA2",.9]], gradientAngle: Math.PI * -45/180}
});

/* do something, may be you need get data with ajax */
window.setTimeout(function() {

	/* change height for rank */
	var height = $('#wcMotion').height() + 125;
	$('#wcMotion').height(height);

	/* load data */
	today.setDate(today.getDate() - 1);
	$('#wcMotion').wcChart({
		height: height,	// width and height must be set if change
		day: today,
		data: [14759, 0, 2000, 8000, 3252, 5645, 6000, 34, 5454, 2],
		rankRef : {height: 125, avatar: avatarImg, title: "夺得03月13日排行榜冠军", url: "http://www.baidu.com"},
		fill: {gradient: [["#21B881",.1], ["#0E8FA2",.9]], gradientAngle: Math.PI * -45/180}
	});
}, 1000);

/* change image url and you can see redraw later */
window.setTimeout(function() {
	avatarImg.src = "https://s-media-cache-ak0.pinimg.com/236x/7a/32/50/7a3250c0094a3c80edee5e30f2f67667.jpg";
}, 2000);
