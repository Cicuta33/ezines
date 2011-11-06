/*
	scripts.js
	--------------------------------------------------
	Custom, additional javascript and (jQuery) scripts
*/
var eZine =  {
	tocHTML: null,
	scroller: [],
	pages: null,
	articles: [],
	isTouch: null,
	currentIndex: 0,
	timer: null,
	articleScroller: null,
	pageScroller: null,
	$body: $('body'),
	init: function(){
		
		// touch check
		eZine.isTouch = $('html').hasClass('touch');
	//	eZine.isTouch = true;
		
		
		
		eZine.menuBar = $('#document > header');
		
		$('header > nav > ul > li > a').click(function(e){
			var a = $(this);
			var li = a.parent();
			var className = li.attr('class');
			
			switch(true) {
			case /toc\b/.test(className):
				if (eZine.isTouch) {
					if (eZine.swiper) eZine.swiper.slide(1,200);
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
				if (eZine.isTouch && eZine.swiper) {
					eZine.swiper.slide(0,200);
					e.preventDefault();
				}
				break;
			default:
				e.preventDefault();
			
			}
		});

		// get Table of Contents (toc)
		eZine.getToc();
		
		if (eZine.isTouch) {

			$('article.toc .toc li a').live('click',function(e){
				if (eZine.swiper) {
					var li = $(this).closest('li');
					eZine.swiper.slide((li.index()+2),200);
					e.preventDefault();
				}
			});
			
			$('.article-0 nav a').live('click',function(e){
				if (eZine.swiper) {
					eZine.pages.find('a[href="'+$(this).attr('href')+'"]').click();
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
					var data = $(data).find('nav.toc');
					
					
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
							
							var link = a[0].href.replace(document.location.protocol+'//'+document.location.host,'');
							
							ol.append('<li class="'+a.closest('li').attr('class')+' '+(link==currentHref?'current':'')+'"><a href="'+a.attr('href')+'">'+i+' <em><span>'+text+'</span></em><span/></a></li>'); 
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
						if (eZine.isTouch) eZine.prepareArticles();
						
						
						
					}
					
				}
			});
		});
	}, 
	prepareArticles: function(){
		
		$('body').addClass('init');
		
		// number of articles + cover and index
		var amount = eZine.pages.find('li').length;
		
		
		var container = $('<div id="container"/>');
		var current = $('#document > article');
		
		var width = current.width();
		current.width(width);
		
		
		var currentToggle = false;
		
		container.append(current);
		eZine.pages.find('li').each(function(i){
			
			var li = $(this);
			li.attr('id','article-'+i).css({width: (100/amount)+'%'}).data('width',(100/amount)+'%');
			
			var article = $('<article data-index="'+i+'" class="article-'+i+' '+li.attr('class')+'"></article>');
			article.width(width);
			if ($(this).hasClass('current')) {
				
				currentToggle = true;
				eZine.currentIndex = i;
				current.attr('data-index',i).addClass('current article-'+i);
				
				eZine.articles[i] = current[0].innerHTML;
				current.html('');

			}
			else if (!currentToggle) current.before(article);
			else if (currentToggle) {
				container.append(article);
				
			}
		});
		
		
		$('#document').append(container);
		
		eZine.swiper = new Swipe(document.getElementById('document'), {
			container: document.getElementById('container'),
			selector: '>article',
			startSlide: eZine.currentIndex,
			isNavigator: true,
			caller: 'navigator',
			callback: function(e,index, slides){
				
					eZine.currentIndex = index;
				
					var backgroundColor = (index>0 && index<slides.length-1) ? window.getComputedStyle(slides[index],null).getPropertyValue("background-color") : 'transparent';
					document.body.style.backgroundColor = backgroundColor;
					eZine.renderArticle(index, true);
					
					
					
					eZine.pages.find('>li.current').removeClass('current');
					eZine.pages.find('>li:eq('+eZine.currentIndex+')').addClass('current');

					
				
			},
			doubleTap: function(e){
				
				eZine.triggerMenu();
				
			    (e)?e.stopPropagation():window.event.cancelBubble = true;
			},
			singleTap: function(){
				eZine.hideMenu();
			}
			
		});
		
		
		$('body').addClass('swipable');
		
		setInterval(function(){
			if ($('body').hasClass('open-menu')) {
				eZine.menuBar.css({top: $(window).scrollTop()});
				$('#pages').css({top: ($(window).scrollTop()+window.innerHeight)});
			}
		},10);
		
		
		

		
		$('<div id="pages"/>').appendTo('body');
		$('#pages').append(eZine.pages);
		
		eZine.pages.find('a').click(function(e){
			
			
				if (eZine.swiper) eZine.swiper.slide($(this).closest('li').index(),200);
				if (eZine.tocSwiper) {
					eZine.tocSwiper.reset();
					eZine.tocSwiper.lock();
				}
				eZine.hideMenu();
				e.preventDefault();
			
		});
		
		
		eZine.tocSwiper = new Swipe(document.getElementById('pages'), {
			container: eZine.pages[0],
			selector: '>li',
			elementWidth: 210
			  
		});

		
		
		eZine.preloadArticles();
	},
	triggerMenu: function(){
		eZine.menuBar.css({top: $(window).scrollTop()});
		$('#pages').css({top: ($(window).scrollTop()+window.innerHeight)});


		eZine.pages.width(eZine.pages.find('li').length*220);
		
		
		
		if (eZine.tocSwiper) {
			eZine.tocSwiper.unlock();
			eZine.tocSwiper.slide(eZine.currentIndex);
		}
		
		$('body').addClass('open-menu');
	},
	hideMenu: function(){
		eZine.menuBar.css({top: -10000});
		$('#pages').css({top: -10000});
		$('body').removeClass('open-menu');
		
		// reset the open toc state
		
		
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
			
			$.ajax({
				url: li.find('a').attr('href'),
				
				async: false,
				success: function(data){
					li.addClass('loaded');
					data = $(data).find('article:first');
					
					
					
				
					eZine.articles[li.index()] = data[0].innerHTML;
					
				}
			
			});
		}
	},
	renderArticle: function(index, slided){
		
		$('body').removeClass('home').removeClass('toc');
		if (index==0) $('body').addClass('home');
		if (index==1) $('body').addClass('toc');
		
		
		$('#container').css({minHeight: window.innerHeight});
		 
		$('#container > article').css({minHeight: window.innerHeight}).each(function(i){
				var article = $(this);
				
				if (i==index) {
					article[0].innerHTML = eZine.articles[i];
					
				
					article.find('.image-slider > figure').each(function(){
						var _this = this;
						eZine.imageSwiper = new Swipe(_this, {
							container: $('>ol', _this)[0],
							selector: '>li',
							doubleTap: function(e){
								
								eZine.triggerMenu();
								
							    (e)?e.stopPropagation():window.event.cancelBubble = true;
							},
							singleTap: function(){
								eZine.hideMenu();
							}
						});
					});
				
					
					if (eZine.swiper) {
						$('html,body').scrollTop(eZine.swiper.slides[index].scrollPos?eZine.swiper.slides[index].scrollPos:0);
					}
			    	
			    	if (typeof window.history.pushState == 'function') {
						var a = eZine.pages.find('li#article-'+index+' > a');
						history.pushState({}, a.find('em').text(), a.attr('href'));
						document.title = a.find('em').text();
					}
			    	
			    	$('#container > article').css({minHeight: Math.max(window.innerHeight,article.height())});
			    	
			    	
				
				
			} 
			else {

				article.html('');
			}
		});
		
	}
	

};
eZine.init();
if (false) {
var currentcss;

var timer =setInterval(function(){
	
	$.ajax({
		url: 'css.php',
		success: function(data, xhr){
			if (data) {
				if (!currentcss) currentcss = data;
				else if (currentcss!=data) {
					currentcss = data;
					$('.desktop-css').attr('href',$('.desktop-css').attr('href').split('?')[0]+'?'+Math.random());
					$('.base-css').attr('href',$('.base-css').attr('href').split('?')[0]+'?'+Math.random());
					$('.template-css').attr('href',$('.templates-css').attr('href').split('?')[0]+'?'+Math.random());
				}
				
			}
		}
	});
	
	
	
},200);
}

window.onorientationchange = function() {
	
	
	
};