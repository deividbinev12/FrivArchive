/**
* FSG cookie
* Cookie larger and faster
*/	
function COOKIE(){
	this.oneDay = 24*60*60*1000;
};
/**
* Normal cookie
* @cname
* @cvalue
* @exdays
* @allowPHP allow PHP script access this
*/
COOKIE.prototype.set = function(cname, cvalue, exdays, allowPHP){
	var _this = this,
		NOW = new Date(),
		exdays = (typeof exdays == 'undefined') ? _this.oneDay : exdays * _this.oneDay,
		allowPHP = (typeof allowPHP == 'undefined') ? false : true;
		if(_this.availableLocalStorage() && allowPHP == false){
			_this.setStorageWithExpiry(cname, cvalue, exdays);
		}else{
			NOW.setTime( NOW.getTime() + exdays );
			var expires = "expires="+ NOW.toUTCString();
				document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		};
};
/**
* @allowPHP allow PHP script access this
*/
COOKIE.prototype.get = function(cname, allowPHP){
	var _this = this,
		allowPHP = (typeof allowPHP == 'undefined') ? false : true;
		if(_this.availableLocalStorage() && _this.getStorageWithExpiry(cname) && allowPHP == false){
			console.log('FSG.COOKIE.GET', '['+cname+']: Website uses localStore replace for cookie');
			return _this.getStorageWithExpiry(cname);
		}else{
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
		};
};

/**
* Detect Local Storage 
*/
COOKIE.prototype.availableLocalStorage = function(){
	var test = 'test';
		try {
			localStorage.setItem(test, test);
			localStorage.removeItem(test);
			return true;
		} catch(e) {
			return false;
		};
};
/**
* Local Storage with expiry
* PHP Script can't acces this variable
*/
COOKIE.prototype.setStorageWithExpiry = function(key, value, ttl){
	var _this = this, NOW = new Date();

	/* `item` is an object which contains the original value */
	/* as well as the time when it's supposed to expire */
	const item = {
		value: btoa(value),
		expiry: NOW.getTime() + ttl,
	};
	localStorage.setItem(key, JSON.stringify(item));
};
COOKIE.prototype.getStorageWithExpiry = function(key){
	var _this = this, NOW = new Date();
	const itemStr = localStorage.getItem(key);
	/* if the item doesn't exist, return null */
	if (!itemStr) {
		return null;
	};
	try{
		const item = JSON.parse(itemStr);
		/* compare the expiry time of the item with the current time */
		if (NOW.getTime() > item.expiry) {
			/* If the item is expired, delete the item from storage */
			/* and return null */
			localStorage.removeItem(key);
			return null;
		}
		return atob(item.value);
	}catch(e){
		console.log(e);
	};
	return null;
};
/**
* FSG AD class
*/
function AD(){
	/* Options here */
	this.cookieId = 'cookie_ad_delay';
};
AD.prototype.include = function(fileSrc, callback){
    /* Adding the script tag to the head as suggested before */
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = fileSrc;
		/* Fire the loading */
		head.appendChild(script);
		if(typeof(callback) == 'function'){
			callback();
		};
};
/**
* @delay mili seconds
* @adId using different id for each ad block
*/
AD.prototype.delay = function(delay, adId, callback){
	console.log('******************************************');
	console.log('*****You are using FSG.AD.delay() function!*****');
	console.log('******************************************');
	var cookie = new COOKIE(),
		NOW = new Date(),
		cookieId = (typeof adId == 'function' || typeof adId == 'undefined') ? this.cookieId : adId,
		lastTimeAdShown = cookie.get(cookieId);
		/* Check last time ads shown */
		if(typeof lastTimeAdShown != 'undefined' && lastTimeAdShown){
			var nextTime = parseInt(lastTimeAdShown) + delay;
				if(NOW.getTime() > nextTime){
					/* Rest time with this time */
					cookie.set(cookieId, NOW.getTime(), 1);
					/* Callback function called */
					callback();
				}		
		}else{
			/* First this function called */
			cookie.set(cookieId, NOW.getTime(), 1);
		}
		console.log('FSG.AD.delay(): ', 'this time: '+ NOW.getTime());
		cookie = null;
};
/**
* Increase delay showing ad for ...
* @increasing: minute
*/
AD.prototype.increaseDelay = function(delay, adId, callback, increasing){
	console.log('******************************************');
	console.log('*****You are using FSG.AD.increaseDelay() function!*****');
	console.log('******************************************');
	var cookie = new COOKIE();
	var increasing = (typeof increasing == 'undefined') ? 1 * 60 * 1000 : increasing * 60 * 1000,
		increasingId = adId + '_increasing';
	var lastIncreasing = cookie.get(increasingId);
		if(typeof lastIncreasing != 'undefined' && lastIncreasing){
			/* Delay time increased */
			var delay = parseInt(lastIncreasing);
		}
		/* Delay function called */
		this.delay(delay, adId, function(){
			callback();
			cookie.set(increasingId, delay + increasing, 7);
		});
		console.log('FSG.AD.increaseDelay(): ', delay + increasing);
		cookie = null;
};

/**
* FSG Route
* Using history of browser
*/
function ROUTE(options){
	this.debug = false;
	this.actived = false;
	this.list = [];
	this.notFound = true;
	this.isReload = false;
	this.wasPressed = false;
	this.hastag = '';
	this.analyticsCode = ''; /* UA-116920418-3 */
	this.domain = location.protocol + "//" + location.host;
	this.stateAvailable = (typeof history.pushState == 'undefined') ? false : true;
	if(typeof(options) != 'undefined' && typeof(options) == 'object'){
		for(var key in options){
			this[key] = options[key];
		};
	};
	if(this.debug){
		console.time();
	};
	console.log('*******************');
	console.log('****FSG ROUTE******');
	console.log('*******************');
};
ROUTE.prototype.activeClearCache = function(){			
	var _this = this;
		document.onkeydown = fkey;
		document.onkeypress = fkey;
		document.onkeyup = fkey;
		function fkey(e){
			var evt = e || window.event;
				if( _this.wasPressed ) { 
					return; 
				};
				if (evt.keyCode == 116 && evt.ctrlKey) {
					if(confirm("Do you want to clear cache?")){
						location.reload(true);
					};
					_this.wasPressed = true;
					return false;
				};
		};
};
ROUTE.prototype.escapeHtml = function(unsafe) {
	return unsafe.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
};
/* Left trim a string */
ROUTE.prototype.ltrim = function(string, lc){
	var leftChar = (typeof lc == 'undefined') ? ' ' : lc;
		while(string.charAt(0)==leftChar) {
			string = string.substring(1);
		};
		return string;
};
/* Right trim a string */
ROUTE.prototype.rtrim = function(string, rc){
	var rightChar = (typeof rc == 'undefined') ? ' ' : rc;
		while(string.charAt(string.length-1)==rightChar) {
			string = string.substring(0,string.length-1);
		};
		return string;
};
/* Trim left and right of a string */
ROUTE.prototype.trim = function(string, cr) {
	var charRemoval = (typeof cr == 'undefined') ? ' ' : cr;
		return this.rtrim(this.ltrim(string, charRemoval), charRemoval);
};
ROUTE.prototype.ucwords = function(str) {
	return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
		return $1.toUpperCase();
	});
};
/* Convert from string/name/title to slug/url/link */
ROUTE.prototype.toSlug = function(slug){
	return slug.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};
/* Convert from slug to name/title/string */
ROUTE.prototype.unSlug = function(slug){
	 return this.ucwords(slug.replace(/[\-\_]+/g,' '));
};
ROUTE.prototype.isArray = function(object){
	return object instanceof Array;
};
/* Add event to element */
ROUTE.prototype.addEvent = function(elem, event, fn) {
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
    } else {
        elem.attachEvent("on" + event, function() {
            /* set the this pointer same as addEventListener when fn is called */
            return(fn.call(elem, window.event));   
        });
    };
};
/* DOM content loaded*/
ROUTE.prototype.ready = function(callback){
    /* in case the document is already rendered */
    if (document.readyState!='loading'){ 
		callback();
    }else if (document.addEventListener){ 
		/* modern browsers */
		document.addEventListener('DOMContentLoaded', callback);
    }else{ 
		/* IE <= 8 */
		document.attachEvent('onreadystatechange', function(){
			if (document.readyState=='complete') callback();
		});
	};
};
ROUTE.prototype.pushLinksToState = function(wrapperId, force){
	var wrapperId = (typeof wrapperId == 'undefined') ? document : $(wrapperId).get(0);
	var force = (typeof force == "undefined") ? false : true;
	/* Add all links */
	var links = wrapperId.getElementsByTagName('a'), _this = this;
		if(links.length > 0){
			for(var i=0; i< links.length; i++){
				var className = (links[i].getAttribute('class') != null && typeof(links[i].getAttribute('class')) != 'undefined' && links[i].getAttribute('class')) ? links[i].getAttribute('class') : '';
					if(links[i].target != '_blank'
						&& links[i].target != '_top'
						&& (links[i].getAttribute('data-click-added') != 'true' || force)
						&& _this.escapeHtml(links[i].href).indexOf('%7B%7B') == -1 && className.indexOf('no-history') == -1){
						links[i].onclick = function(){
							_this.addToRouter({url: this.href}, this.href, this.title || this.href);
							return false;
						};
						links[i].setAttribute('data-click-added', 'true');
					};
			};
		};
};
ROUTE.prototype.addToRouter = function(data, url, name){
	var name = (typeof name == 'undefined') ? '' : name,  _this = this, 
		url = url.replace(_this.domain, ''); 
		url = (url != '/') ? _this.rtrim(_this.rtrim(url, '/'), '#') : url; 
		data.url = url;
		if(_this.stateAvailable){
			try{
				window.history.pushState(data, name, url);
				/* Run it */
				_this.runRouter(url);
				if(_this.debug){
					console.log('FSG.ROUTE.addToRouter: ', url);
				}
			}catch(e){
				if(_this.debug){
					console.warn('FSG.ROUTE.addToRouter: ', e.message);
				};
			};
		}else{
			var hashtag = '/#',
				hashtagUrl = _this.ltrim(_this.ltrim(url, '/'), '#');
				location.href = _this.domain + hashtag + hashtagUrl;
			   _this.runRouter('/'+hashtagUrl);
		};
};
ROUTE.prototype.runRouter = function(url){ 
	var _this = this;
		if(_this.list.length > 0){ 
			for(var id=0; id < _this.list.length; id++){
				try{
					var patt = new RegExp('^\#?'+_this.list[id].pattern+'$', "gi"),
						param = patt.exec(url); 
					   _this.notFound = true;
						console.log('FSG.ROUTE.runRouter: ', url);
						if(param){
							if(param.length > 0) { 
								param.shift(); 
							};
							if(typeof(_this.list[id].callback) == 'function'){
								_this.list[id].callback.apply(this, param);
							}else if(typeof(_this.list[id].callback) == 'string'){
								window[_this.list[id].callback].apply(this, param);  
							};
							_this.notFound = false;
							break;
						};
				}catch(e){};
			};
			if(_this.notFound){
				if(typeof(_this.pageNotFound) == 'function'){
					_this.pageNotFound(url);
				};
			}else{ 
				if(typeof(gtag) == 'function'){
					if(_this.analyticsCode){
						var urlWithastag = url.replace(_this.domain + '/', '');
							if(_this.hastag && _this.hastag != '' && _this.hastag != '#'){
								urlWithastag += '#' + _this.hastag;
							}
							gtag('config', _this.analyticsCode, {'page_path': urlWithastag});
					}else{
						console.warn('ROUTE.runRouter: ', 'No Google Analytics ID!');
					};
				};
			};
		}else{
			_this.isReload = true;
		};
};
/* Get URL app */
ROUTE.prototype.get = function(pattern, callback, where){
	var re = /[a-z]+/;
	var _this = this;
		if(typeof where != 'undefined' && typeof where == 'object' && where !== null){
			for (var key in where) {
				if (where.hasOwnProperty(key)) {
					pattern = pattern.replace('{{'+ key +'}}', where[key]); 
					if(_this.debug){
						console.log('FSG.ROUTE.get: ', key + " -> " + where[key]);
					}
				}
			}
		};
		if (re.test(pattern.replace('{{').replace('}}'))) {
			var repattern = pattern.replace(/\{\{[^\}]+\}\}/gi, '([^\/]+)');
				this.list.push({pattern: repattern, callback: callback});
		}else{
			this.list.push({pattern: pattern, callback: callback});
		}	
};
ROUTE.prototype.init = function(currentPage){
	var _this = this;
		_this.actived = true;
		if(_this.stateAvailable){
			/* Modern Browsers */
			window.onpopstate = function(e){
				if (e.state) {
					_this.runRouter(e.state.url);
				};
			};
		}else{
			/* IE8+, FF3.6+, Chrome */
			_this.addEvent(window, 'hashchange', function(e){
				var url = location.hash.replace(/^\#/, '/');
					_this.runRouter(url);
			});
		};
		_this.ready(function(){
			var ua = window.navigator.userAgent, msie = ua.indexOf('MSIE '); 
				if (msie > 0) {
					/* IE 10 or old */
					setTimeout(function(){
							_this.pushLinksToState();
						}, 50);
				}else{
					_this.pushLinksToState();
				};
		});		
		if(typeof currentPage != 'undefined' && currentPage == true){
			/* Add current URL */
			_this.addToRouter({url: document.URL}, document.URL, document.title || '');			
		};
};
ROUTE.prototype.destroy = function(callback){
	if(typeof(callback) != 'undefined'){
		window[callback]();
	};
	if(_this.debug){ console.timeEnd(); };
};

/**
* FSG DB
* Query to object faster & shorter
*/
function DB(){
	this.DATA = (this.DATA) ? this.DATA : [];
	this.working = (this.working) ? this.working : [];
	this.isReady = (this.isReady) ? this.isReady : false;
};
DB.prototype.startup = function(){
	this.table();
};
DB.prototype.loading = function(cacheExpired){
	var last_site_loading = FSG.COOKIE.get('cookie_site_loading'); 
		/* Get last value of loading layer */
		if(typeof last_site_loading == 'undefined' || !last_site_loading){
			/* Assign layer loading to site */
			$('body').append('<div id="waiting_ready" style="background:rgba(0,0,0,0.35);position:fixed;left:0;top:0;right:0;bottom:0;z-index:999"><div class="loader"></div></div>');
			$('body #waiting_ready .loader').css({marginTop: ($(window).height() - 132)/2});
			
			/* Hide loading layer */
			setTimeout(function(){ $('#waiting_ready').fadeOut(); }, 5000);
		};			
		/* Cache expired day*/
		if(typeof cacheExpired != 'undefined' && (typeof last_site_loading == 'undefined' || !last_site_loading)){
			FSG.COOKIE.set('cookie_site_loading', 'yes', cacheExpired);
		};
		return this;
};
DB.prototype.endLoading = function(){
	$('#waiting_ready').fadeOut();
	return this;
};
DB.prototype.table = function(tableName, altTable){			
	var tableName = (typeof tableName == 'undefined') ? 'games' : tableName,
		_this = this;
		_this.isReady = false;
		/* When table is a array object */
		if (tableName.length > 0 && tableName.constructor === Array && typeof tableName[0] != 'undefined') {
			_this.working = tableName;
			_this.isReady = true;
			return this;
		};
		/* Get DATA form json file */
		if(_this.DATA.length < 1){
			$.getJSON(settings.baseUrl + 'public/js/json/'+tableName+'.js', {t: new Date().getHours()}, function(result) { 
				if (result.length > 0 && result.constructor === Array && typeof result[0] != 'undefined') {
					_this.DATA = result;
					_this.working = result;
					_this.isReady = true;	
					console.log('FSG.DB.table: ', 'Table ['+ tableName + '] is loaded!');		
				}else{
					/* Load altermate table */
					console.warn('FSG.DB.table (Error): ', 'Table ['+ tableName + '] is failed!');
					if(typeof altTable != 'undefined'){
						_this.table(altTable);
					};
				};
			}).fail(function() { 
				/* Load altermate table */
				console.warn('FSG.DB.table (Error): ', 'Table ['+ tableName + '] is failed!');
				if(typeof altTable != 'undefined'){
					_this.table(altTable);
				};
			});
		}else{
			_this.working = _this.DATA;
			_this.isReady = true;
		}
		return this;
};
DB.prototype.tableWithLoading = function(tableName, cacheExpired, altTable){
	this.loading(cacheExpired);
	this.table(tableName, altTable);
	return this;			
};
DB.prototype.from = function(tableName){
	this.table(tableName);
	return this;
};
DB.prototype.ready = function(callback, isFirst, times){
	var _this = this,
		timing = (typeof isFirst == 'undefined' || isFirst == true) ? 1 : isFirst,
		times = (typeof firstRow == 'undefined') ? 3000 : times;
	var counter = 0,
		timeout = setInterval(function(){
			if(counter > times){
				clearInterval(timeout);
			}
			if(_this.isReady == true){
				if(typeof callback == 'string'){
					if(isFirst == true){ /* Get first rows */
						if(typeof _this.working[0] != 'undefined' && _this.working[0]){
							window[callback](_this.working[0]);
						}else{
							window[callback](null);
						}
					}else{
						window[callback](_this.working);
					}
				}else if(typeof callback == 'function'){
					if(isFirst == true){ /* Get first rows */
						if(typeof _this.working[0] != 'undefined' && _this.working[0]){
							callback(_this.working[0]);
						}else{
							callback(null);
						}
					}else{
						callback(_this.working);
					}
				};
				clearInterval(timeout);
			}
			counter++;
		}, timing);		
};
DB.prototype.where = function(fields, math, tableName, callback){
	var _this = this;
		_this.ready(function(){
			if(typeof fields == 'object'){
				var rows = (typeof(tableName) != 'undefined' && tableName instanceof Array) ? tableName : _this.working, resultData=[];
					_this.isReady = false;
					if(rows instanceof Array && rows.length > 0){
						resultData = rows.filter(function(row){
							var result = false;
								for(var field in fields){
									try{
										var fieldKey = row[field];
										var fieldValue = fields[field];											
											if(typeof(math) == 'undefined' || math == '='){
												if(typeof(fieldKey) != 'undefined' && typeof(fieldKey) != 'function' && fieldKey == fieldValue){
													result = true;
													break;
												};
											}else if(math == '<>'){
												if(typeof(fieldKey) != 'undefined' && typeof(fieldKey) != 'function' && fieldKey != fieldValue){
													result = true;
													break;
												};
											}else if(math == '>'){
												if(typeof(fieldKey) != 'undefined' && typeof(fieldKey) != 'function' && fieldKey > fieldValue){
													result = true;
													break;
												};
											}else if(math == '<'){
												if(typeof(fieldKey) != 'undefined' && typeof(fieldKey) != 'function' && fieldKey < fieldValue){
													result = true;
													break;
												};
											}else if(math == 'LIKE'){									
												var pattern = new RegExp(fieldValue, 'gi');
													if(typeof(fieldKey) != 'undefined' && typeof(fieldKey) != 'function' && pattern.test(fieldKey)){
														result = true;
														break;
													};
											};
									}catch(e){
										if (_this.debug) { 
											console.warn(e.message); 
										};
									}	
								};
							return result;
						});
				};
				_this.working = resultData;
				_this.isReady = true;
				
				/* Call function */
				if(typeof(callback) != 'undefined'){
					callback(resultData);
				};
			};
		});
		
	return this;				
};
DB.prototype.priority = function(obj){
	var _this = this;
		if(typeof obj.fields != 'undefined' && typeof obj.value != 'undefined'){
			var NEW_DATA = obj.fields.flatMap(f => _this.working.filter(
				function(row, key){ 
					if(typeof(row[f]) != 'undefined' && typeof(row[f]) != 'function' && row[f] == obj.value){
						_this.working.splice(key, 1);
						return true;
					}
				}
			));
			_this.working = NEW_DATA.map((item, i) => Object.assign({}, item, _this.working[i]));
		};
	return this;	
};
DB.prototype.whereLike = function(fields, callback, tableName){
	this.where(fields, 'LIKE', tableName, callback);
	return this;
};
DB.prototype.whereEq = function(fields, callback, tableName){
	this.where(fields, tableName, callback);
	return this;
};
DB.prototype.whereNot = function(fields, callback, tableName){
	this.where(fields, '<>', tableName, callback);
	return this;
};
DB.prototype.whereGt = function(fields, callback, tableName){
	this.where(fields, '>', tableName, callback);
	return this;
};
DB.prototype.whereLt = function(fields, callback, tableName){
	this.where(fields, '<', tableName, callback);
	return this;
};
DB.prototype.whereIn = function(fields, callback, tableName){
	var _this = this;
		_this.ready(function(){
			if(typeof fields == 'object'){
				var rows = (typeof(tableName) != 'undefined' && tableName instanceof Array) ? tableName : _this.working, resultData=[];
					_this.isReady = false;
					if(rows instanceof Array && rows.length > 0){
						var r = rows.filter(function(row){
							var result = false;
								for(var field in fields){
									try{
										var inArray = fields[field].split(',');
										var index = inArray.indexOf(row[field]+'');
										if(typeof(row[field]) != 'undefined'&& typeof(row[field]) != 'function' && index != -1){
											resultData[index] = row;
											result = true;
											break;
										};
									}catch(e){
										if (this.debug) { 
											console.warn(e.message); 
										};
									}	
								};
							return result;
						});
				};
				_this.working = resultData;
				_this.isReady = true;
				
				if(typeof(callback) != 'undefined'){
					callback(resultData);
				};
			};
		});
	return this;				
};
DB.prototype.orderBy = function(field, _order){ 
	var _this = this;
		_this.ready(function(){
			_this.isReady = false;						
			var array = _this.working,
				attrs = [];
				if(typeof field === 'object' && !Array.isArray(field) && field !== null){
					$.each(field, function(key, value){
						var order = (value.toLowerCase() == 'asc') ? '' : '-';
							attrs.push(order + key);
					});
				}else{
					var order = (typeof _order != 'undefined' && _order.toLowerCase() == 'asc') ? '' : '-';
						attrs = [order + field];
				}
			var predicates = attrs.map(function(pred){
					var descending = pred.charAt(0) === '-' ? -1 : 1;
					pred = pred.replace(/^-/, '');
					return {
						getter: function(o){ return o[pred];}/*o => o[pred]*/,
						descend: descending
					};
				});
				_this.working = array.map(function(item){
					return {
						src: item,
						compareValues: predicates.map(function(predicate){ return predicate.getter(item);}/*predicate => predicate.getter(item)*/)
					};
				})
				.sort(function(o1, o2) {
					var i = -1, result = 0;
						while (++i < predicates.length) {
							if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
							if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
							if (result *= predicates[i].descend) break;
						}
						return result;
					})
				.map(function(item){return item.src;}/*item => item.src*/);
				_this.isReady = true;
		});
	return this;	
};
DB.prototype.limit = function(offset, take){
	var _offset = (typeof take == 'undefined') ? 0 : offset;
	var _take = (typeof take == 'undefined') ? offset : (take + _offset);
	var _this = this;
		_this.ready(function(){
			_this.isReady = false;
			_this.working = _this.working.slice(_offset, _take);
			_this.isReady = true;
		});
		return this;
};
DB.prototype.get = function(callback){ 
	this.ready(callback);
};
DB.prototype.first = function(callback){
	this.ready(callback, true);
};
	
/**
* FSG View
*/	
function VIEW(){
	/* Option here */
	this.now = new Date();
}
VIEW.prototype.load = function(sectorId, componentUrl, comfirm, callback){
	var _this = this;
	var fn = (typeof callback == 'undefined') ? comfirm : callback,
		csrfToken = $('meta[name="csrf-token"]').attr('content'),
		componetPath = settings.baseUrl + componentUrl;
		$.get(componetPath + '?t='+ _this.now.getHours(), {'_token': csrfToken}, function(result){
			if(result){
				$(sectorId).append(result);
				var doneCounter = 0,
					stoDone = setTimeout(function(){
					if(doneCounter > 500){
						clearTimeout(stoDone);
						fn(false);
					}else{
						if(typeof($(comfirm).get(0)) != 'undefined'){
							fn(result);
							clearTimeout(stoDone);
						}
					}
					doneCounter++;
				}, 10);
				console.log('FSG.VIEW.load: ', 'Component ['+ componentUrl +'] is loaded!');
			}else{
				fn(false);
			};
		}).fail(function(){ 
			fn(false);
			console.warn('FSG.VIEW.load (Error): ', "Component ["+ componentUrl +"] is failed!");
		});
		return this;
};

/*****************************************************************\
******* FSG Script written by ****** FlashStorage.Games! **********
*******************************************************************
* --------------------------------------------------------------- *
*                                                                 *
* Cookie : Work with cookie and Local Storage                     * 
* Route: Work with URI history (pushState)                        *
* View: Work with components                           *
* DB: Work with object                                            *
*                                                                 *
\*****************************************************************/
var FSG = {
	COOKIE: new COOKIE(),
	ROUTE: new ROUTE(),
	DB:	new DB(),
	VIEW: new VIEW(),
	AD: new AD(),
	alert: function(object){
		if(typeof(object) == 'string'){
			alert(object);
		}else{
			alert(JSON.stringify(object));
		};
	}
};
