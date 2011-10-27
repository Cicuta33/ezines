<?php 
$url = explode('/mag/',$_SERVER['REQUEST_URI']);  ?>
<!doctype html>
<!--[if lt IE 7]>		<html class="no-js ie ie6" lang="en">	<![endif]-->
<!--[if IE 7]>			<html class="no-js ie ie7" lang="en">	<![endif]-->
<!--[if IE 8]>			<html class="no-js ie ie8" lang="en">	<![endif]-->
<!--[if gt IE 8]><!-->	<html class="no-js" lang="en">			<!--<![endif]-->
<head>
	<meta charset="utf-8">

	<title>Rijksoverheid Magazines</title>
	<meta name="author" content="Name"/>
	<meta name="robots" content="index, follow"/>
	<meta name="keywords" content="Name"/>
	<meta name="description" content="Description"/>

	<link rel="home" href="http://www.domainname.com/"/>
	<link rel="index" href="http://www.domainname.com/sitemap/"/>
	<link rel="alternate" type="application/rss+xml" title="RSS" href="http://feeds.feedburner.com/atom-feed-name"/>

	<!-- Mobile viewport optimized -->
	<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0">

	<!-- Web app will display in full screen mode when launched from the Web Clip icon -->
	<meta name="apple-mobile-web-app-capable" content="yes"/>
	<meta name="apple-mobile-web-app-status-bar-style" content="black"/> <!-- options: 1) default, 2) black or 3) black-translucent -->

	<!-- Full screen startup Web app image (iphone: 320x460px, iphone4: 640x920px and in portrait orientation) -->
	<link rel="apple-touch-startup-image" media="screen and (resolution: 163dpi)" href="images/startup/my-custom-startup-image-iphone.png">
	<link rel="apple-touch-startup-image" media="screen and (resolution: 326dpi)" href="images/startup/my-custom-startup-image-iphone4.png">

	<!-- Universal CSS for IE6 (http://code.google.com/p/universal-ie6-css/) -->
	<!--[if ! lte IE 6]><!-->
	    <link class="base-css" rel="stylesheet" href="stylesheets/css/base.css" media="screen, handheld"/>
	    <link rel="stylesheet" href="stylesheets/css/mobile.css" media="only screen and (max-width: 720px)"/>
	    <link class="desktop-css" rel="stylesheet" href="stylesheets/css/desktop.css" media="only screen and (min-width: 720px)"/>
	    <link class="templates-css" rel="stylesheet" href="stylesheets/css/templates.css" media="only screen"/>
	    <!--[if (lt IE 9)&(!IEMobile)]><link rel="stylesheet" href="stylesheets/css/desktop.css" media="all"/><![endif]-->
	<!--<![endif]-->
	<!--[if lte IE 6]><link rel="stylesheet" href="stylesheets/ie6/ie6.1.1.css" media="screen"/><![endif]-->

	<!-- All Javascript at the bottom, except for Modernizr (enables HTML5 elements and feature detects) (http://www.modernizr.com) plus Selectivzr (enables CSS3 selectors for IE) (http://selectivizr.com) -->
	<script src="javascript/libs/modernizr-2.0.6.min.js"></script>
	
	<!-- Google Webfont Loader (see also dealing wiht FOUT: http://www.html5rocks.com/tutorials/webfonts/quick/#toc-fout) -->
	<script src="javascript/libs/webfont.js"></script>
	<script>WebFont.load({custom:{families:["RijksoverheidSansHeadingBold","RijksoverheidSansTextRegular","RijksoverheidSerifRegular"],urls:["type/rijksoverheidsansheading-bold.css","type/rijksoverheidsanstext-regular.css","type/rijksoverheidserif-regular.css"]}});</script>
	
</head>
<body>
	<div id="document"<?php echo ($url[1]==''?' class="home"':''); ?>>
		<header>
			<h1 class="logo">Rijksoverheid Magazines</h1>
			
			<nav role="navigation">
				<ul>
					<li class="home"><a href="/mag/">home</a></li>
					<li class="toc"><a href="/mag/toc">index</a></li>
					<li class="settings"><a href="/mag/settings">settings</a></li>
					<li class="export"><a href="/mag/export">export</a></li>
				</ul>
			</nav>
		</header>
	<?php 
		@include('_'.($url[1]==''?'cover':$url[1]).'.php'); 
	?>
	</div>
	

	<!-- Javascript at the bottom for fast page loading -->

	
	<script src="javascript/libs/jquery-1.6.4.min.js"> </script>
	<script src="javascript/libs/swipe.js"> </script>
	<script src="javascript/plugins.js"> </script>
	<script src="javascript/script.js"> </script>

	

</body>
</html>