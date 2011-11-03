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
	articles: [],
	isIpad: null,
	currentIndex: 0,
	timer: null,
	articleScroller: null,
	pageScroller: null,
	$body: $('body'),
	init: function(){
		
		// ipad check
		eZine.isIpad = navigator.userAgent.match(/iPad/i) != null;
		//eZine.isIpad = true;
		
		
		
	
		
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
				if (eZine.isIpad && eZine.swiper) {
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
		
		if (eZine.isIpad) {
			$('body').bind('toggle-menu',function(){
				clearTimeout(eZine.timer);
				eZine.timer = setTimeout(function(){
					clearTimeout(eZine.timer);
					if ($('body').hasClass('open-index')) {
						$('body').removeClass('open-index');
						$('body').removeClass('has-menu');
						eZine.pages.width('100%');
						
					}
					else {
						$('body').toggleClass('has-menu');
					}
					
					
				},550);
			});
			$('article.toc .toc li a').live('click',function(e){
				if (eZine.swiper) {
					var li = $(this).closest('li');
					eZine.swiper.slide((li.index()+2),200);
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
						if (eZine.isIpad) eZine.prepareArticles();
						
						
						
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
		
		var currentToggle = false;
		
		container.append(current);
		eZine.pages.find('li').each(function(i){
			
			var li = $(this);
			li.attr('id','article-'+i).css({width: (100/amount)+'%'}).data('width',(100/amount)+'%');
			
			var article = $('<article data-index="'+i+'" class="article-'+i+' '+li.attr('class')+'"></article>');
			if ($(this).hasClass('current')) {
				
				currentToggle = true;
				eZine.currentIndex = i;
				current.attr('data-index',i).addClass('current article-'+i);
				
				eZine.articles[i] = current.find('>div').clone();
				current.html('')

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
			callback: function(e,index){
				
				
				
					
					eZine.renderArticle(index, true);
				
			}
			
		});
		
		$('body').removeClass('init');
		$('body').addClass('swipable');
		
		
		

		
		$('<div id="pages"/>').appendTo('body');
		$('#pages').append(eZine.pages);
		
		eZine.pages.find('a').click(function(e){
			
			if (!$('body').hasClass('open-index')) {
				eZine.pages.width(eZine.pages.find('li').length*220);
				
				
				var el = eZine.pages.find('li.current').prev();
				if (!el.length) el = eZine.pages.find('li:first');
				
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
			
			$.ajax({
				url: li.find('a').attr('href'),
				
				async: false,
				success: function(data){
					li.addClass('loaded');
					data = $('<div>'+data+'</div>').find('#document > article:first').find('>div');
					
					
				
					eZine.articles[li.index()] = data;
					
				}
			
			});
		}
	},
	renderArticle: function(index, slided){
		
		
		
		
		
		$('#container').css({minHeight: window.innerHeight});
		$('#container > article').css({minHeight: window.innerHeight}).each(function(i){
				var article = $(this);

				if (i==index) {
					
					
					article.html(eZine.articles[i]);
					
					article.find('figure:has(video)').each(function(){
						$(this).html($(this).html());
					});
					
					article.find('section.image-slider>figure').each(function(){
						var _this = this;
						eZine.imageSwiper = new Swipe(_this, {
							container: $('>ol', _this)[0],
							selector: '>li'
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