var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

var MENU = {
	lastTitle: $('title').text(),
	init: function(){
		var toggler = $('.menu__toggler'),
			menu    = $('.menu');	
			/*
			 * Toggles on and off the 'active' class on the menu
			 * and the toggler button.
			 */
			toggler.click(function() {
				var dataActived = toggler.data('actived');
					if(dataActived == 1){
						toggler.removeClass('active');
						menu.removeClass('active');
						toggler.data('actived', 0);
					}else{
						toggler.addClass('active');
						menu.addClass('active');
						toggler.data('actived', 1);
					}
					return false;
			});
			toggler.bind('mouseup', function(){
				return false;
			});
			menu.bind('mouseup', function(){
				return false;
			});
			$(document).bind('mouseup', function(){
				toggler.data('actived', 0);
				toggler.removeClass('active');
				menu.removeClass('active');
				return false;
			});
			/* Search */
			MENU.search();	
	},
	search: function(){
		$('.search-box input').focus(function(){
			$(this).select();
		});
		var lastData = null,
			lastLength = 0;
			$('.search-box input').bind('keyup', function(){
				var keywords = $(this).val(),
					searchHTML = '';
					if(keywords != '' && keywords.length > 0){
						$('title').text('Searching: '+keywords);
						if(typeof $("#module-container div.game:first").get(0) != 'undefined'){
							$("#module-container div.game:contains('" + keywords + "')").each(function(i, item){
								var aTagGame = $(item).find('a'),
									gameName = aTagGame.data('name'),
									gameImg =  aTagGame.data('image'),
									href = aTagGame.attr('href');
									if(gameName && i < 6){
										searchHTML += '<a class="search-game" href="'+ href +'"><img src="'+gameImg+'" height="100%" align="left"><b class="game-name">'+gameName+'</a></a>';
									}
							});
							if(searchHTML){
								$('.search-box-sub').html(searchHTML);
							}else{
								$('.search-box-sub').empty();
							}
						}else{
							if(lastLength < keywords.length && lastData != null){ /* re-search old data */
								$.each(lastData, function(i, item){
									if(item.name.toUpperCase().indexOf(keywords.toUpperCase()) != -1){
										searchHTML += '<a class="search-game" href="'+ item.href +'"><img src="'+ item.img +'" height="100%" align="left"><b class="game-name">'+ item.name +'</a></a>';
									}
								});
								$('.search-box-sub').html(searchHTML);
							}else{
								/* Search with new data */
								$.post(settings.baseUrl + 'search', {keywords: keywords, _token: $('meta[name="csrf-token"]').attr('content')}, function(jsonData){
									if(jsonData.length > 0){
										var resHTML = '';
											lastData = jsonData;
											$.each(jsonData, function(i, item){
												resHTML += '<a class="search-game" href="'+ item.href +'"><img src="'+ item.img +'" height="100%" align="left"><b class="game-name">'+ item.name +'</a></a>';
											});
											$('.search-box-sub').html(resHTML);
									}else{
										$('.search-box-sub').empty();
									}
								});
							}
						}
					}else{
						$('.search-box-sub').empty();
						$('title').text(MENU.lastTitle);
					};
					lastLength = keywords.length;
			});
	}
	
};
MENU.init();

var Alert = {
	init: function(){
		this.showAlert();
	},
	flashPlayerInstalled: function() {
		var isFlash = false;
			try {
				isFlash = Boolean(new ActiveXObject('ShockwaveFlash.ShockwaveFlash') && typeof(window.RufflePlayer) == 'undefined');
			} catch (exception) {
				isFlash = ('undefined' != typeof navigator.mimeTypes['application/x-shockwave-flash'] && typeof(window.RufflePlayer) == 'undefined');
			}
			return isFlash;
	},
	rufflePlayerInstalled: function(){
		if(typeof(window.RufflePlayer) != 'undefined' && typeof(window.RufflePlayer.newest) == 'function'){
			return true;
		}
		return false;
	},
	setCookie: function(cname, cvalue, exdays) {
		const d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		let expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	},
	getCookie: function(cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');
		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	},
	showAlert: function(){
		var laterCookie = 'later_install_flash'+ 032,
			later = Alert.getCookie(laterCookie);
			if(this.flashPlayerInstalled() == false && later != 'true'){
				$('.alert-box')
				.css({'animation': 'slideRight 0.5s forwards'})
				.find('.alert-later').click(function(){
					$('.alert-box').css({'animation': 'slideLeft 0.5s forwards'});
					Alert.setCookie(laterCookie, 'true', 1/50);
				});
				$('.alert-box .alert-wrapper').css({margin: '10px', width: 'auto'});
				$('.alert-box .alert-text').html('Your browser does not have <a href="https://help.flashstorage.games/" target="_blank">Adobe Flash Player</a> built in, download and install WaterFox Browser, the browser specifically for Flash.');
				$('.alert-box .alert-link').text('Install Now');
			}
			if(this.flashPlayerInstalled() != false){
				$('#support_flash_player').hide();
			}
	}
};
Alert.init();

}
/*
     FILE ARCHIVED ON 08:46:05 Jun 22, 2023 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 10:31:07 Sep 30, 2023.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3))

*/
/*
playback timings (ms):
  captures_list: 102.875
  exclusion.robots: 0.072
  exclusion.robots.policy: 0.063
  cdx.remote: 0.058
  esindex: 0.009
  LoadShardBlock: 59.73 (3)
  PetaboxLoader3.datanode: 150.415 (5)
  load_resource: 274.535 (2)
  PetaboxLoader3.resolve: 104.964 (2)
*/
