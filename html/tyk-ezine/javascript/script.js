/*
	scripts.js
	--------------------------------------------------
	Custom, additional javascript and (jQuery) scripts
*/
var eZine =  {
	menuVisible: false,
	menuTriggers: window.Zepto ? 'longTap tap' : null,
	tocHTML: null,
	scroller: [],
	pages: null,
	isIpad: null,
	currentIndex: 0,
	timer: null,
	articleScroller: null,
	pageScroller: null,
	$body: $('body'),
	init: function(){
		
		// ipad check
		eZine.isIpad = navigator.userAgent.match(/iPad/i) != null;
	
		
		// touch actions
		eZine.menuTriggers && $('#document').bind(eZine.menuTriggers, function(e){
			
			if (eZine.menuVisible) {
				eZine.$body.removeClass('has-menu');
				eZine.menuVisible = false;
			}
			else {
				eZine.$body.addClass('has-menu');
				eZine.menuVisible = true;
			}
			e.preventDefault();
		});
		
		$('header > nav > ul > li > a').click(function(e){
			var a = $(this);
			var li = a.parent();
			var className = li.attr('class');
			
			switch(true) {
			case /toc\b/.test(className):
				if (eZine.isIpad) {
					eZine.articleScroller.scrollToPage(1,0,0);
					e.preventDefault();
				} 
				else {
					
					
					if (eZine.$body.hasClass('open-toc')) {
						eZine.$body.removeClass('open-toc');
						
					}
					else {
						eZine.$body.addClass('open-toc');
						$(document).bind('mouseup',function(e){
							if ($(e.target).closest('li').hasClass('toc')) {
								$(document).unbind('mouseup');
							}
							else {
								eZine.$body.removeClass('open-toc');
							}
						});
						
					}
					e.preventDefault();
				}
				break;
			case /home\b/.test(className):
				if (eZine.isIpad) {
					eZine.articleScroller.scrollToPage(0,0,0);
					e.preventDefault();
				}
				break;
			default:
				e.preventDefault();
			
			}
		});

		// get Table of Contents (toc)
		eZine.getToc();
		
		if (eZine.isIpad) {
			$('body').bind('toggle-menu',function(){
				clearTimeout(eZine.timer);
				eZine.timer = setTimeout(function(){
					clearTimeout(eZine.timer);
					if ($('body').hasClass('open-index')) {
						$('body').removeClass('open-index');
						$('body').removeClass('has-menu');
						eZine.pages.width('100%');
						if (eZine.pageScroller) {
							eZine.pageScroller.disable();
							eZine.pageScroller.scrollTo(0,0,0);
						}
					}
					else {
						$('body').toggleClass('has-menu');
					}
					
					
				},550);
			});
			$('article.toc li a').live('click',function(e){
				if (eZine.articleScroller) {
					var li = $(this).closest('li');
					eZine.articleScroller.scrollToPage((li.index()+2),0,0);
					e.preventDefault();
				}
			});
		}
		
		
	
	},
	getToc: function(){
		$('nav .toc a').each(function(){
			var a = $(this);
			var url = $(this).attr('href');
			$.ajax({
				url: url,
				success: function(data) {
					data = data.replace(/<script(.|\s)*?\/script>/gi, '');
					var matches = (/<nav class="toc">([\s\S]*?)<\/nav>/mi).exec(data);
					
					if (matches) {
						data = matches[0]; 
					}
					
					eZine.tocHTML = $(data).addClass('dynamic-toc').append('<p class="back"><a href="'+url+'">&laquo; terug naar index</a></p>');
					if (eZine.tocHTML && eZine.tocHTML.length) {
						$('#document').append(eZine.tocHTML);
						
						
						
						var currentHref = document.location.pathname;
						var current = 0;
						
						
						
						var href = '';
						var menu = $('#document > header > nav > ul');
						var ol = $('<ol id="prev-next"/>');
						var i = 0;
						
						$('> li.home > a, > li.toc > a', menu).add(eZine.tocHTML.find('li > a')).each(function(){
							var a = $(this);
							i++;
							var text = a.find('h2').length ? a.find('h2').text() : a.text();
							ol.append('<li class="'+a.closest('li').attr('class')+' '+(a.attr('href')==currentHref?'current':'')+'"><a href="'+a.attr('href')+'">'+i+' <em><span>'+text+'</span></em><span/></a></li>'); 
						});
						 
						ol.find('li.current').prev().addClass('prev');
						ol.find('li.current').next().addClass('next');
						
					
						
						var ul = $('<ul><li>vorige</li><li>volgende</li></ul>');
						ul.find('li').click(function(){
							var li = $(this);
							var trigger = ol.find('li'+(li.index()==0?'.prev':'.next'));
							if (trigger.length) {
								document.location.href = trigger.find('a').attr('href');
							}
							
						});
						$('<nav class="prev-next"/>').append(ol).append('<p>/'+i+'</p>').append(ul).appendTo('#document');
						
						if (!ol.find('.prev').length) {
							ul.find('li:first').addClass('disabled');
						}
						if (!ol.find('.next').length) {
							ul.find('li:last').addClass('disabled');
						}
						ol.addClass('indicator');
						eZine.pages = ol;
						
						// now we have a toc, let's prepare the iscroll
						if (eZine.isIpad) eZine.customScrollbar();
						
						
					}
					
				}
			});
		});
	}, 
	customScrollbar: function(){
		$('body').addClass('has-menu');
		$('body').addClass('iscroll');
		$('#document').width(window.innerWidth).height(window.innerHeight-32);
		eZine.prepareArticles();
		
		
		eZine.articleScroller = new iScroll('document', {
			scroller: $('#container')[0],
			snap: true,
			momentum: false,
			hScrollbar: false,
			lockDirection: true,
			snapThreshold: 80,
			onScrollEnd: function () {
				$('body').addClass('done');
				if (this.currPageX==0) $('body').addClass('home');
				else $('body').removeClass('home');
				$('body').removeClass('has-menu');
				$('ol.indicator li.current').removeClass('current');
				$('ol.indicator li:eq('+this.currPageX+')').addClass('current');
				if (typeof window.history.pushState == 'function') {
					var a = eZine.pages.find('li#article-'+this.currPageX+' > a');
					
					history.pushState({}, a.find('em').text(), a.attr('href'));
					document.title = a.find('em').text();
				}
			}
		 });

		
		
		var scrollers = new Array();
		
		
		$('#container > article').each(function(i,o){
			
			scrollers[i] = new iScroll(o, {hScroll: false, lockDirection: true, onScrollEnd: function(){$('body').removeClass('has-menu');}});
			
		});
		eZine.articleScroller.scrollToPage(eZine.currentIndex,0,0);
		
		
	},
	prepareArticles: function(){
		// number of articles + cover and index
		var amount = eZine.pages.find('li').length;
		
		var container = $('<div id="container"/>');
		
		var current = $('#document > article');
		
		var currentToggle = false;
		container.css({width: amount+'00%'});
		container.append(current);
		eZine.pages.find('li').each(function(i){
			var li = $(this);
			li.attr('id','article-'+i).css({width: (100/amount)+'%'}).data('width',(100/amount)+'%');
			
			var article = $('<article class="article-'+i+' '+li.attr('class')+'" '+(i==0?'id="cover"':'')+'><div/></article>').css({left: (i*(100/amount))+'%', width: (100/amount)+'%'});
			if ($(this).hasClass('current')) {
				current.addClass('article-'+i).css({left: (i*(100/amount))+'%', width: (100/amount)+'%'});
				currentToggle = true;
				//container.css({left: -(i*100)+'%'});
				eZine.currentIndex = i;
			}
			else if (!currentToggle) current.before(article);
			else if (currentToggle) {
				container.append(article);
				
			}
		});
		$('#document').append(container);
		
		$('#document > header > h1').addClass('logo').appendTo('#cover > div');
		
		$('<div id="pages"/>').appendTo('body');
		$('#pages').append(eZine.pages);
		
		eZine.pages.find('a').click(function(e){
			
			if (!$('body').hasClass('open-index')) {
				eZine.pages.width(eZine.pages.find('li').length*220);
				if (!eZine.pageScroller) {
					 eZine.pageScroller = new iScroll($('#pages')[0], {vScroll: false, lockDirection: true });
				}
				eZine.pageScroller.enable();
				var el = eZine.pages.find('li.current').prev();
				if (!el.length) el = eZine.pages.find('lifirst');
				eZine.pageScroller.scrollToElement(el[0], 0);
				$('body').addClass('open-index');
				e.preventDefault();
			}
			else {
				eZine.articleScroller.scrollToPage($(this).closest('li').index(),0,0);
				e.preventDefault();
			}
		});
		
		eZine.preloadArticles();
	},
	preloadArticles: function(){
		eZine.pages.find('li.next, li.prev').each(function(){
			loadArticle(this);
		});
		eZine.pages.find('li:not(.loaded, .current)').each(function(){
			loadArticle(this);
		});
		
		function loadArticle(li){
			li = $(li);
			var h1;
			$.ajax({
				url: li.find('a').attr('href'),
				async: false,
				success: function(data){
					li.addClass('loaded');
					data = data.replace(/<script(.|\s)*?\/script>/gi, '');
					var matches = (/<article.*>([\s\S]*?)<\/article>/mi).exec(data);
					
					if (matches) {
						data = matches[0];
					}
					else { return; }
					if (li.hasClass('home')) h1 = $('h1.logo:first');
					$('article.'+li.attr('id')+' > div:first').html($(data).find('> div').html());
					if (li.hasClass('home')) {
						$('article.'+li.attr('id')+' > div:first').append(h1);
					}
					
					
					
				}
			
			});
		}
	}
	

};
eZine.init();

window.onorientationchange = function() {
	$('#document').width(window.innerWidth).height(window.innerHeight-32);
	eZine.articleScroller.refresh();
	eZine.articleScroller.scrollToPage(eZine.articleScroller.currPageX,0,0);
	
	
};